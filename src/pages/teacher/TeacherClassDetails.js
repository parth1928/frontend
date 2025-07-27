import { useEffect, useState } from "react";
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { 
    Paper, 
    Box, 
    Typography, 
    ButtonGroup, 
    Button, 
    Popper, 
    Grow,
    ClickAwayListener, 
    MenuList, 
    MenuItem 
} from '@mui/material';
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
    const classID = currentUser?.teachSclass?._id;
    const subjectID = currentUser?.teachSubjects?.[0]?._id; // Use first subject from teachSubjects array
    
    // If we're missing required IDs, show appropriate message
    React.useEffect(() => {
        if (!classID || !subjectID) {
            // ...removed for production...
        } else {
            // ...removed for production...
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
                    return;
                }

                // Get adminId from currentUser's school
                const adminId = currentUser?.school?._id;

                // Validate classID
                if (typeof classID !== 'string' || classID === 'undefined' || classID === 'null') {
                    return;
                }

                // Always pass the adminId to get both regular and D2D students
                await dispatch(getClassStudents(classID, adminId));
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };

        fetchStudents();
    }, [dispatch, classID, currentUser]);

    const [isDownloading, setIsDownloading] = React.useState(false);


    // Filter students for selected batch if lab
    const filteredStudents = React.useMemo(() => {
        if (!Array.isArray(sclassStudents)) {
            return [];
        }
        if (subjectDetails.isLab && selectedBatch) {
            return sclassStudents.filter(student =>
                batchList.find(b => b.batchName === selectedBatch)?.students?.includes(student._id)
            );
        }
        return sclassStudents;
    }, [subjectDetails.isLab, selectedBatch, sclassStudents, batchList]);

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
            // ...removed for production...
            alert(error.message || 'Failed to download attendance');
        } finally {
            setIsDownloading(false);
        }
    };

    if (error) {
    // ...removed for production...
    }

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
    ]

    // Debug: Log fetched students and create rows with validation
    const studentRows = React.useMemo(() => {
        if (!Array.isArray(filteredStudents)) {
            // ...removed for production...
            return [];
        }
    // ...removed for production...
        return filteredStudents.map((student) => ({
            name: student.name || 'No Name',
            rollNum: student.rollNum || 'No Roll Number',
            id: student._id,
        }));
    }, [filteredStudents]);

    const StudentsButtonHaver = ({ row }) => {
        const options = ['Take Attendance', 'Provide Marks'];

        const [open, setOpen] = React.useState(false);
        const anchorRef = React.useRef(null);
        const [selectedIndex, setSelectedIndex] = React.useState(0);

        const handleClick = () => {
            // ...removed for production...
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
        };                const handleBulkAttendance = () => {
            if (!classID || !subjectID) {
                alert('Missing required class or subject information');
                return;
            }
            if (subjectDetails.isLab && batchList.length > 0 && !selectedBatch) {
                alert('Please select a batch to take bulk attendance for this lab subject.');
                return;
            }
            navigate(`/Teacher/class/student/bulk-attendance/${classID}/${subjectID}${subjectDetails.isLab && selectedBatch ? `?batch=${encodeURIComponent(selectedBatch)}` : ''}`);
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
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 2 },
                width: '100%'
            }}>
                <BlueButton
                    variant="contained"
                    onClick={() =>
                        navigate("/Teacher/class/student/" + row.id)
                    }
                    sx={{
                        py: { xs: 1, sm: 'inherit' },
                        fontSize: { xs: '0.9rem', sm: 'inherit' }
                    }}
                >
                    View
                </BlueButton>

                <React.Fragment>
                    <ButtonGroup 
                        variant="contained" 
                        ref={anchorRef} 
                        aria-label="split button"
                        sx={{ 
                            width: { xs: '100%', sm: 'auto' },
                            '& .MuiButton-root': {
                                py: { xs: 1, sm: 'inherit' },
                                fontSize: { xs: '0.9rem', sm: 'inherit' }
                            }
                        }}
                    >
                        <Button 
                            onClick={handleClick}
                            sx={{ flex: { xs: 1, sm: 'inherit' } }}
                        >
                            {options[selectedIndex]}
                        </Button>
                        <BlackButton
                            size="small"
                            aria-controls={open ? 'split-button-menu' : undefined}
                            aria-expanded={open ? 'true' : undefined}
                            aria-label="select merge strategy"
                            aria-haspopup="menu"
                            onClick={handleToggle}
                            sx={{
                                px: { xs: 2, sm: 1 }
                            }}
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
                                <Paper sx={{ 
                                    minWidth: { xs: '200px', sm: 'auto' },
                                    maxHeight: { xs: '70vh', sm: 'auto' },
                                    overflowY: 'auto'
                                }}>
                                    <ClickAwayListener onClickAway={handleClose}>
                                        <MenuList 
                                            id="split-button-menu" 
                                            autoFocusItem
                                            sx={{
                                                '& .MuiMenuItem-root': {
                                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                                    py: { xs: 1.5, sm: 1 }
                                                }
                                            }}
                                        >
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
            </Box>
        );
    };

    return (
        <>
            {loading ? (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    height: '200px'
                }}>
                    <Typography>Loading...</Typography>
                </Box>
            ) : (
                <>
                    <Typography 
                        variant="h4" 
                        align="center" 
                        gutterBottom
                        sx={{
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                            my: { xs: 2, sm: 3 }
                        }}
                    >
                        Class Details
                    </Typography>
                    {subjectDetails.isLab && batchList.length > 0 && (
                        <FormControl 
                            fullWidth 
                            sx={{ 
                                mb: 2,
                                '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.9rem', sm: '1rem' }
                                },
                                '& .MuiSelect-select': {
                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                    py: { xs: 1, sm: 1.5 }
                                }
                            }}
                        >
                            <InputLabel>Select Batch</InputLabel>
                            <Select
                                value={selectedBatch}
                                label="Select Batch"
                                onChange={e => setSelectedBatch(e.target.value)}
                                size="small"
                            >
                                {batchList.map((batch, idx) => (
                                    <MuiMenuItem 
                                        key={idx} 
                                        value={batch.batchName}
                                        sx={{ 
                                            fontSize: { xs: '0.9rem', sm: '1rem' }
                                        }}
                                    >
                                        {batch.batchName}
                                    </MuiMenuItem>
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
                        <Paper sx={{ 
                            width: '100%', 
                            overflow: 'hidden',
                            p: { xs: 1, sm: 2 },
                            boxShadow: { xs: 1, sm: 3 },
                            borderRadius: { xs: 1, sm: 2 }
                        }}>
                            <Typography 
                                variant="h5" 
                                gutterBottom
                                sx={{
                                    fontSize: { xs: '1.2rem', sm: '1.5rem' },
                                    mb: { xs: 2, sm: 3 }
                                }}
                            >
                                Students List:
                            </Typography>

                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: { xs: 'column', sm: 'row' },
                                justifyContent: 'space-between', 
                                alignItems: { xs: 'stretch', sm: 'center' }, 
                                mb: 2,
                                gap: 2
                            }}>
                                <Typography 
                                    variant="h5"
                                    sx={{
                                        fontSize: { xs: '1.2rem', sm: '1.5rem' },
                                        textAlign: { xs: 'center', sm: 'left' }
                                    }}
                                >
                                    Students List:
                                </Typography>
                                <BlueButton
                                    variant="contained"
                                    onClick={() => {
                                        if (!classID || !subjectID) {
                                            alert('Missing required class or subject information');
                                            return;
                                        }
                                        if (subjectDetails.isLab && batchList.length > 0 && !selectedBatch) {
                                            alert('Please select a batch to take bulk attendance for this lab subject.');
                                            return;
                                        }
                                        navigate(`/Teacher/class/student/bulk-attendance/${classID}/${subjectID}${subjectDetails.isLab && selectedBatch ? `?batch=${encodeURIComponent(selectedBatch)}` : ''}`);
                                    }}
                                    sx={{
                                        py: { xs: 1.5, sm: 1 },
                                        fontSize: { xs: '0.9rem', sm: '1rem' }
                                    }}
                                >
                                    Take Bulk Attendance
                                </BlueButton>
                            </Box>
                            <Box sx={{ 
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                                gap: 2, 
                                mb: 2 
                            }}>
                                <BlueButton
                                    onClick={() => navigate("/Teacher/class/addstudents")}
                                    sx={{
                                        py: { xs: 1.5, sm: 1 },
                                        fontSize: { xs: '0.9rem', sm: '1rem' }
                                    }}
                                >
                                    Add Students
                                </BlueButton>
                                <BlueButton
                                    onClick={() => downloadExcel(selectedBatch)}
                                    disabled={isDownloading}
                                    sx={{
                                        py: { xs: 1.5, sm: 1 },
                                        fontSize: { xs: '0.9rem', sm: '1rem' }
                                    }}
                                >
                                    {isDownloading ? 'Downloading...' : 'Download Attendance'}
                                </BlueButton>
                                <BlueButton
                                    onClick={() => setShowQuickAttendance(!showQuickAttendance)}
                                    sx={{
                                        py: { xs: 1.5, sm: 1 },
                                        fontSize: { xs: '0.9rem', sm: '1rem' }
                                    }}
                                >
                                    {showQuickAttendance ? 'Hide Quick Attendance' : 'Quick Attendance'}
                                </BlueButton>
                            </Box>
                            {showQuickAttendance && (
                                <Box sx={{ mb: 2 }}>
                                    {(!subjectDetails.isLab || (subjectDetails.isLab && selectedBatch)) ? (
                                        <QuickAttendance classID={classID} subjectID={subjectID} batchName={selectedBatch} />
                                    ) : (
                                        <Typography color="error">Please select a batch to take quick attendance for this lab subject.</Typography>
                                    )}
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