import { useEffect, useState, useMemo } from "react";
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { 
    Paper, 
    Box, 
    Typography,
    Chip,
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem as MuiMenuItem,
    Button,
    ButtonGroup,
    Popper,
    Grow,
    ClickAwayListener,
    MenuList,
    MenuItem,
    CircularProgress
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { BlackButton, BlueButton} from "../../components/buttonStyles";
import TableTemplate from "../../components/TableTemplate";
import QuickAttendance from './QuickAttendance';
import axios from "../../api/axiosInstance";
import { useSubject } from '../../context/SubjectContext';
import { useClass } from '../../context/ClassContext';

const TeacherClassDetails = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { sclassStudents, loading, error, getresponse } = useSelector((state) => state.sclass);
    const { selectedSubject } = useSubject();
    const { selectedClass } = useClass();
    const { currentUser } = useSelector((state) => state.user);
    const classID = selectedClass?._id || currentUser?.teachSclass?._id;
    const subjectID = selectedSubject?._id || currentUser?.teachSubjects?.[0]?._id; // Use selected subject or fall back to first subject
    
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
        const fetchSubjectDetails = async () => {
            if (!subjectID) {
                console.log('No subjectID for fetching details');
                return;
            }
            
            console.log('Fetching subject details for:', subjectID);
            try {
                const response = await axios.get(`/subject/${subjectID}`);
                console.log('Subject details response:', response.data);
                setSubjectDetails(response.data);
                if (response.data.isLab && Array.isArray(response.data.batches)) {
                    setBatchList(response.data.batches);
                    console.log('Set batch list:', response.data.batches.length);
                }
            } catch (error) {
                console.error("Error fetching subject details:", error);
            }
        };

        fetchSubjectDetails();
    }, [subjectID]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                if (!classID) {
                    console.log('No classID provided');
                    return;
                }

                // Validate classID
                if (typeof classID !== 'string' || classID === 'undefined' || classID === 'null') {
                    console.log('Invalid classID:', classID);
                    return;
                }

                console.log('Fetching students for class:', classID);
                
                // Try to get adminId from currentUser, but it's not required anymore
                const adminId = currentUser?.school?._id;
                console.log('AdminId:', adminId);
                
                // Always call getClassStudents - backend will handle getting adminId from class if needed
                await dispatch(getClassStudents(classID, adminId));
                console.log('Students fetch dispatched');
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };

        fetchStudents();
    }, [dispatch, classID, currentUser]);

    const [isDownloading, setIsDownloading] = React.useState(false);


    // Filter students for selected batch if lab
    const filteredStudents = React.useMemo(() => {
        console.log('Filtering students:', { sclassStudents, subjectDetails, selectedBatch, batchList });
        
        if (!Array.isArray(sclassStudents)) {
            console.log('sclassStudents is not an array:', sclassStudents);
            return [];
        }
        
        // The API returns a flat array of students, not an object
        let result = sclassStudents;
        console.log('Initial students count:', result.length);
        
        // Apply batch filter if this is a lab subject
        if (subjectDetails.isLab && selectedBatch && batchList.length > 0) {
            const batch = batchList.find(b => b.batchName === selectedBatch);
            if (batch && Array.isArray(batch.students)) {
                result = result.filter(student => 
                    batch.students.includes(student._id)
                );
                console.log('After batch filter:', result.length);
            }
        }
        
        console.log('Final filtered students:', result.length);
        return result;
    }, [sclassStudents, subjectDetails.isLab, selectedBatch, batchList]);

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

    const [studentColumns, setStudentColumns] = useState([
        { id: 'rollNum', label: 'Roll No.', minWidth: 140 },
        { id: 'name', label: 'Name', minWidth: 250 },
        { id: 'type', label: 'Student Type', minWidth: 150 },
        { id: 'percentage', label: 'Attendance %', minWidth: 180, align: 'center' }
    ]);

    const [studentsWithPercentage, setStudentsWithPercentage] = useState([]);
    const [isLoadingPercentages, setIsLoadingPercentages] = useState(false);

    // Fetch attendance percentages for the selected subject
    useEffect(() => {
        const fetchAttendancePercentages = async () => {
            if (!classID || !subjectID) {
                console.log('Missing classID or subjectID for attendance fetch:', { classID, subjectID });
                return;
            }
            
            console.log('Fetching attendance percentages for class:', classID, 'subject:', subjectID);
            setIsLoadingPercentages(true);
            try {
                // Use the same endpoint as coordinator reports for consistency
                const adminId = currentUser?.school?._id;
                const response = await axios.get(`/class-attendance/${classID}?adminId=${adminId || ''}`);
                console.log('Attendance percentages response:', response.data);
                
                if (response.data && response.data.students && Array.isArray(response.data.students)) {
                    // Process the data to extract subject-specific percentages
                    const processedStudents = response.data.students.map(student => {
                        // Find the percentage for the selected subject
                        const subjectData = student.attendance.subjectWise.find(
                            sub => sub.subject === selectedSubject?.subName
                        );
                        
                        return {
                            _id: student._id,
                            name: student.name,
                            rollNum: student.rollNum,
                            type: student.type,
                            percentage: subjectData ? subjectData.percentage : 0
                        };
                    });
                    
                    setStudentsWithPercentage(processedStudents);
                    console.log('Set students with percentages:', processedStudents.length);
                }
            } catch (error) {
                console.error("Error fetching attendance percentages:", error);
            } finally {
                setIsLoadingPercentages(false);
            }
        };

        fetchAttendancePercentages();
    }, [classID, subjectID, selectedSubject, currentUser]);

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
        }

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
                    
                    {/* Class and Subject indicator */}
                    <Paper
                        elevation={2}
                        sx={{
                            p: 2,
                            mb: 3,
                            backgroundColor: 'rgba(25, 118, 210, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            maxWidth: '600px',
                            mx: 'auto'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Current Class:
                            </Typography>
                            <Chip 
                                label={selectedClass?.sclassName || 'No Class Selected'} 
                                color="primary" 
                                variant="outlined"
                            />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Current Subject:
                            </Typography>
                            <Chip 
                                label={selectedSubject ? `${selectedSubject.subName} (${selectedSubject.subCode})` : 'No Subject Selected'} 
                                color="secondary" 
                                variant="outlined"
                            />
                        </Box>
                        {subjectDetails && subjectDetails.isLab && (
                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    Type:
                                </Typography>
                                <Chip 
                                    label="Lab Subject" 
                                    color="success" 
                                    variant="outlined"
                                />
                            </Box>
                        )}
                    </Paper>
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
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <Typography color="text.secondary">
                                {getresponse}
                            </Typography>
                        </Box>
                    ) : !Array.isArray(sclassStudents) || sclassStudents.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <Typography color="text.secondary">
                                No students found in this class
                            </Typography>
                        </Box>
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
                            {Array.isArray(filteredStudents) && filteredStudents.length > 0 && (
                                <>
                                    {isLoadingPercentages ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : (
                                        <TableTemplate 
                                            columns={studentColumns} 
                                            rows={filteredStudents.map(student => {
                                                // Find attendance percentage for this student
                                                const studentPercentage = studentsWithPercentage.find(
                                                    s => s._id === student._id
                                                );
                                                
                                                // Format percentage display with color coding
                                                let percentageDisplay;
                                                if (isLoadingPercentages) {
                                                    percentageDisplay = "Loading...";
                                                } else if (!studentPercentage) {
                                                    percentageDisplay = "N/A";
                                                } else {
                                                    // Color code based on percentage - same as coordinator reports
                                                    let color = "inherit";
                                                    if (studentPercentage.percentage >= 75) color = "success.main"; 
                                                    else if (studentPercentage.percentage >= 60) color = "warning.main";
                                                    else color = "error.main";
                                                    
                                                    percentageDisplay = (
                                                        <Typography color={color} fontWeight="bold">
                                                            {studentPercentage.percentage.toFixed(2)}%
                                                        </Typography>
                                                    );
                                                }
                                                
                                                return {
                                                    id: student._id,
                                                    rollNum: student.rollNum,
                                                    name: student.name,
                                                    type: student.type || 'Regular', // Use the type from API response
                                                    percentage: percentageDisplay
                                                };
                                            })}
                                        />
                                    )}
                                </>
                            )}
                        </Paper>
                    )}
                </>
            )}
        </>
    );
};

export default TeacherClassDetails;