import { useEffect } from "react";
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { Paper, Box, Typography, ButtonGroup, Button, Popper, Grow, ClickAwayListener, MenuList, MenuItem } from '@mui/material';
import { BlackButton, BlueButton} from "../../components/buttonStyles";
import TableTemplate from "../../components/TableTemplate";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import QuickAttendance from './QuickAttendance';

const TeacherClassDetails = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { sclassStudents, loading, error, getresponse } = useSelector((state) => state.sclass);

    const { currentUser } = useSelector((state) => state.user);
    const classID = currentUser.teachSclass?._id;
    const subjectID = currentUser.teachSubject?._id;
    // Debug: Log classID and subjectID
    console.log('TeacherClassDetails: classID:', classID, 'subjectID:', subjectID);

    const [showQuickAttendance, setShowQuickAttendance] = React.useState(false);

    useEffect(() => {
        // Use currentUser.school?._id for adminId if available, else fallback to currentUser._id
        let adminId = currentUser.school?._id;
        // Debug: Log adminId before dispatch
        console.log('TeacherClassDetails: adminId:', adminId);
        // Final defensive check: Only dispatch if classID is valid
        if (classID && typeof classID === 'string' && classID !== 'undefined' && classID !== 'null') {
            if (adminId && typeof adminId === 'string' && adminId.trim() !== '' && adminId !== 'undefined' && adminId !== 'null') {
                dispatch(getClassStudents(classID, adminId));
            } else {
                dispatch(getClassStudents(classID));
            }
        } else {
            console.warn('TeacherClassDetails: Invalid classID, skipping fetch.');
        }
    }, [dispatch, classID, currentUser]);

    const [isDownloading, setIsDownloading] = React.useState(false);

    // Debug: Log fetched students after fetch
    React.useEffect(() => {
        console.log('TeacherClassDetails: sclassStudents:', sclassStudents);
    }, [sclassStudents]);

    const BACKEND_URL = process.env.REACT_APP_API_BASE_URL;
    
    const downloadExcel = async () => {
        if (!classID || !subjectID) {
            alert('Class and Subject information is required');
            return;
        }

        setIsDownloading(true);
        try {
            const token = localStorage.getItem('token');
            console.log('Downloading attendance for:', classID, subjectID);
            const response = await fetch(
                `${BACKEND_URL}/attendance/download/${classID}/${subjectID}`,
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

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `attendance_${classID}_${new Date().toISOString().slice(0,10)}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
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
    const studentRows = sclassStudents.map((student) => {
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
                                    onClick={() => navigate(`/Teacher/class/student/bulk-attendance/${subjectID}`)}
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
                                    onClick={downloadExcel}
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
                                    <QuickAttendance classID={classID} subjectID={subjectID} />
                                </Box>
                            )}
                            {Array.isArray(sclassStudents) && sclassStudents.length > 0 &&
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