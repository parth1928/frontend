import { useEffect, useState } from "react";
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { Paper, Box, Typography, ButtonGroup, Button, Popper, Grow, ClickAwayListener, MenuList, MenuItem } from '@mui/material';
import { BlackButton, BlueButton} from "../../components/buttonStyles";
import TableTemplate from "../../components/TableTemplate";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import QuickAttendance from './QuickAttendance';
import { FormControl, InputLabel, Select, MenuItem as MuiMenuItem } from "@mui/material";
import axios from "axios";

const TeacherClassDetails = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { sclassStudents, loading, error, getresponse } = useSelector((state) => state.sclass);

    const { currentUser } = useSelector((state) => state.user);
    // Ensure we have valid IDs before using them
    const classID = currentUser?.teachSclass?._id;
    const subjectID = currentUser?.teachSubject?._id;
    
    // If we're missing required IDs, show appropriate message
    React.useEffect(() => {
        if (!classID || !subjectID) {
            console.warn('Missing required IDs:', { classID, subjectID });
        }
    }, [classID, subjectID]);

    const [showQuickAttendance, setShowQuickAttendance] = React.useState(false);
    const [subjectDetails, setSubjectDetails] = useState({});
    const [batchList, setBatchList] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');

    // Fetch subject details (with batches) on mount
    useEffect(() => {
        if (subjectID) {
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/subject/${subjectID}`)
                .then(res => {
                    setSubjectDetails(res.data);
                    if (res.data.isLab && Array.isArray(res.data.batches)) {
                        setBatchList(res.data.batches);
                    }
                });
        }
    }, [subjectID]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                if (!classID) {
                    console.warn('TeacherClassDetails: Missing classID');
                    return;
                }

                // Get adminId from currentUser
                const adminId = currentUser?.school?._id;

                // Validate classID and adminId
                if (typeof classID !== 'string' || classID === 'undefined' || classID === 'null') {
                    console.warn('TeacherClassDetails: Invalid classID');
                    return;
                }

                if (adminId && typeof adminId === 'string' && adminId.trim() && adminId !== 'undefined' && adminId !== 'null') {
                    await dispatch(getClassStudents(classID, adminId));
                } else {
                    await dispatch(getClassStudents(classID));
                }
            } catch (error) {
                console.error('TeacherClassDetails: Error fetching students:', error);
            }
        };

        fetchStudents();
    }, [dispatch, classID, currentUser]);

    const [isDownloading, setIsDownloading] = React.useState(false);


    // Filter students for selected batch if lab
    const filteredStudents = subjectDetails.isLab && selectedBatch
        ? sclassStudents.filter(student =>
            batchList.find(b => b.batchName === selectedBatch)?.students.includes(student._id)
        )
        : sclassStudents;

    const BACKEND_URL = process.env.REACT_APP_API_BASE_URL;
    
    const downloadExcel = async (batchName) => {
        if (!classID || !subjectID) {
            alert('Class and Subject information is required');
            return;
        }
        // For lab subjects, require batch selection
        if (subjectDetails.isLab && batchList.length > 0 && !batchName) {
            alert('Please select a batch to download attendance for this lab subject.');
            return;
        }

        setIsDownloading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `${BACKEND_URL}/attendance/download/${classID}/${subjectID}`;
            if (subjectDetails.isLab && batchName) {
                url += `?batch=${encodeURIComponent(batchName)}`;
            }
            const response = await fetch(
                url,
                {
                    headers: {
                        'Authorization': token || ''
                    }
                }
            );
            // Check if response is ok before trying to parse it
            if (!response.ok) {
                throw new Error('Failed to download attendance');
            }
            // Get the response as blob directly
            const blob = await response.blob();
            if (blob.type.includes('application/json')) {
                // If we got JSON instead of an Excel file, there's an error
                const reader = new FileReader();
                reader.onload = () => {
                    const errorData = JSON.parse(reader.result);
                    alert(errorData.message || 'Failed to generate Excel file');
                };
                reader.readAsText(blob);
                return;
            }
            const urlObj = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = urlObj;
            link.download = `attendance_${classID}_${new Date().toISOString().slice(0,10)}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(urlObj);
        } catch (error) {
            console.error('Download failed:', error);
            alert(error.message || 'Failed to download attendance');
        } finally {
            setIsDownloading(false);
        }
    };

    if (error) {
        console.log(error)
    }

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
    ]

    // Debug: Log fetched students
    console.log('TeacherClassDetails: sclassStudents:', sclassStudents);
    const studentRows = filteredStudents.map((student) => {
        return {
            name: student.name,
            rollNum: student.rollNum,
            id: student._id,
        };
    })

    const StudentsButtonHaver = ({ row }) => {
        const options = ['Take Attendance', 'Provide Marks'];

        const [open, setOpen] = React.useState(false);
        const anchorRef = React.useRef(null);
        const [selectedIndex, setSelectedIndex] = React.useState(0);

        const handleClick = () => {
            console.info(`You clicked ${options[selectedIndex]}`);
            if (selectedIndex === 0) {
                handleAttendance();
            } else if (selectedIndex === 1) {
                handleMarks();
            }
        };

        const handleAttendance = () => {
            navigate(`/Teacher/class/student/attendance/${row.id}/${subjectID}`)
        }
        const handleMarks = () => {
            navigate(`/Teacher/class/student/marks/${row.id}/${subjectID}`)
        };

        const handleBulkAttendance = () => {
            navigate(`/Teacher/class/student/bulk-attendance/${subjectID}`)
        };

        const handleMenuItemClick = (event, index) => {
            setSelectedIndex(index);
            setOpen(false);
        };

        const handleToggle = () => {
            setOpen((prevOpen) => !prevOpen);
        };

        const handleClose = (event) => {
            if (anchorRef.current && anchorRef.current.contains(event.target)) {
                return;
            }

            setOpen(false);
        };
        return (
            <>
                <BlueButton
                    variant="contained"
                    onClick={() =>
                        navigate("/Teacher/class/student/" + row.id)
                    }
                >
                    View
                </BlueButton>

                <React.Fragment>
                    <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
                        <Button onClick={handleClick}>{options[selectedIndex]}</Button>
                        <BlackButton
                            size="small"
                            aria-controls={open ? 'split-button-menu' : undefined}
                            aria-expanded={open ? 'true' : undefined}
                            aria-label="select merge strategy"
                            aria-haspopup="menu"
                            onClick={handleToggle}
                        >
                            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </BlackButton>
                    </ButtonGroup>
                    <Popper
                        sx={{
                            zIndex: 1,
                        }}
                        open={open}
                        anchorEl={anchorRef.current}
                        role={undefined}
                        transition
                        disablePortal
                    >
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin:
                                        placement === 'bottom' ? 'center top' : 'center bottom',
                                }}
                            >
                                <Paper>
                                    <ClickAwayListener onClickAway={handleClose}>
                                        <MenuList id="split-button-menu" autoFocusItem>
                                            {options.map((option, index) => (
                                                <MenuItem
                                                    key={option}
                                                    disabled={index === 2}
                                                    selected={index === selectedIndex}
                                                    onClick={(event) => handleMenuItemClick(event, index)}
                                                >
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </React.Fragment>
            </>
        );
    };

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <Typography variant="h4" align="center" gutterBottom>
                        Class Details
                    </Typography>
                    {subjectDetails.isLab && batchList.length > 0 && (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Select Batch</InputLabel>
                            <Select
                                value={selectedBatch}
                                label="Select Batch"
                                onChange={e => setSelectedBatch(e.target.value)}
                            >
                                {batchList.map((batch, idx) => (
                                    <MuiMenuItem key={idx} value={batch.batchName}>{batch.batchName}</MuiMenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    {getresponse ? (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                No Students Found
                            </Box>
                        </>
                    ) : (
                        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                            <Typography variant="h5" gutterBottom>
                                Students List:
                            </Typography>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h5">
                                    Students List:
                                </Typography>
                                <BlueButton
                                    variant="contained"
                                    onClick={() => {
                                        if (subjectDetails.isLab && batchList.length > 0 && !selectedBatch) {
                                            alert('Please select a batch to take bulk attendance for this lab subject.');
                                            return;
                                        }
                                        navigate(`/Teacher/class/student/bulk-attendance/${subjectID}${subjectDetails.isLab && selectedBatch ? `?batch=${encodeURIComponent(selectedBatch)}` : ''}`);
                                    }}
                                >
                                    Take Bulk Attendance
                                </BlueButton>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <BlueButton
                                    onClick={() => navigate("/Teacher/class/addstudents")}
                                >
                                    Add Students
                                </BlueButton>
                                <BlueButton
                                    onClick={() => downloadExcel(selectedBatch)}
                                    disabled={isDownloading}
                                >
                                    {isDownloading ? 'Downloading...' : 'Download Attendance Excel'}
                                </BlueButton>
                                <BlueButton
                                    onClick={() => setShowQuickAttendance(!showQuickAttendance)}
                                >
                                    {showQuickAttendance ? 'Hide Quick Attendance' : 'Quick Attendance'}
                                </BlueButton>
                            </Box>
                            {showQuickAttendance && (
                                <Box sx={{ mb: 2 }}>
                                    <QuickAttendance classID={classID} subjectID={subjectID} batchName={selectedBatch} />
                                </Box>
                            )}
                            {Array.isArray(filteredStudents) && filteredStudents.length > 0 &&
                                <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
                            }
                        </Paper>
                    )}
                </>
            )}
        </>
    );
};

export default TeacherClassDetails;