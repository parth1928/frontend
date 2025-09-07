import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSubjectDetails } from '../../redux/sclassRelated/sclassHandle';
import {
    Box,
    Button,
    TextField,
    Typography,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Alert,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Chip,
    Divider
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useSubject } from '../../context/SubjectContext';
import { useClass } from '../../context/ClassContext';

const QuickAttendance = ({ classID: propClassID, subjectID: propSubjectID, batchName: propBatchName }) => {
    const dispatch = useDispatch();
    const { subjectDetails } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);
    const { selectedSubject } = useSubject();
    const { selectedClass } = useClass();
    
    // Use context values or props, with context taking precedence
    const classID = selectedClass?._id || currentUser?.teachSclass?._id || propClassID;
    const subjectID = selectedSubject?._id || propSubjectID;
    
    const [selectedBatch, setSelectedBatch] = useState('');
    const [batchStudents, setBatchStudents] = useState([]);
    
    // Fetch subject details (for isLab and batches)
    useEffect(() => {
        if (subjectID) {
            dispatch(getSubjectDetails(subjectID, 'Subject'));
        }
    }, [dispatch, subjectID]);

    // When batch is selected, set students for that batch
    useEffect(() => {
        if (subjectDetails && subjectDetails.isLab && subjectDetails.batches && selectedBatch) {
            const batch = subjectDetails.batches.find(b => b.batchName === selectedBatch);
            setBatchStudents(batch ? batch.students : []);
        } else {
            setBatchStudents([]);
        }
    }, [subjectDetails, selectedBatch]);
    const [date, setDate] = useState(dayjs());
    const [mode, setMode] = useState('present');
    const [rollInput, setRollInput] = useState('');
    const [markedStudents, setMarkedStudents] = useState([]);
    const [message, setMessage] = useState({ text: '', type: 'info' });
    const [loading, setLoading] = useState(false);
    const [multipleMatches, setMultipleMatches] = useState([]);
    const [currentSuffix, setCurrentSuffix] = useState('');
    const [processingQueue, setProcessingQueue] = useState([]);

    // Filtered roll input handler for lab batches
    const handleRollInput = async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            
            if (!classID || !subjectID) {
                setMessage({ text: 'Missing required class or subject information', type: 'error' });
                return;
            }
            
            setLoading(true);

            // Split input by commas and spaces, filter out empty strings
            const suffixes = rollInput.trim()
                .split(/[\s,]+/)
                .filter(suffix => suffix.length > 0);

            if (suffixes.length === 0) {
                setMessage({ text: 'Please enter roll number suffixes', type: 'error' });
                setLoading(false);
                return;
            }

            // For lab: filter only students in selected batch
            let studentsToSearch = (subjectDetails && subjectDetails.isLab && selectedBatch)
                ? batchStudents
                : undefined;

            let previewedStudents = [];
            for (let suffix of suffixes) {
                let rollSuffixToSend = suffix;
                if (!(typeof suffix === 'string' && (suffix[0] === 'D' || suffix[0] === 'd'))) {
                    rollSuffixToSend = suffix.padStart(2, '0');
                }
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/attendance/quick-mark`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': localStorage.getItem('token')
                        },
                        body: JSON.stringify({
                            classId: classID,
                            subjectId: subjectID,
                            date: date.format('YYYY-MM-DD'),
                            rollSuffix: rollSuffixToSend,
                            mode: mode,
                            preview: true,
                            students: studentsToSearch // backend should filter if provided
                        })
                    });
                    const data = await response.json();
                    if (data.success && data.student) {
                        if (!previewedStudents.some(s => s.rollNum === data.student.rollNum)) {
                            previewedStudents.push(data.student);
                        }
                    }
                } catch (error) {
                    // ignore errors for preview
                }
            }
            setMarkedStudents(previewedStudents);
            setLoading(false);
        }
    };

    const handleStudentSelection = async (selectedStudent) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/attendance/quick-mark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    classId: classID,
                    subjectId: subjectID,
                    date: date.format('YYYY-MM-DD'),
                    rollSuffix: selectedStudent.rollNum.toString(), // Use full roll number
                    mode: mode
                })
            });

            const data = await response.json();

            if (data.success && data.student) {
                if (!markedStudents.some(s => s.rollNum === data.student.rollNum)) {
                    setMarkedStudents(prev => [...prev, data.student]);
                    setMessage({
                        text: `Marked ${data.student.name} (Roll: ${data.student.rollNum}) as ${mode}`,
                        type: 'success'
                    });
                }
            }
        } catch (error) {
            // ...removed for production...
            setMessage({
                text: `Error marking student: ${error.message}`,
                type: 'error'
            });
        }

        // Clear dialog and process next suffix if any
        setMultipleMatches([]);
        processNextSuffix();
    };

    const processNextSuffix = () => {
        setProcessingQueue(prev => {
            if (prev.length > 0) {
                // Just remove the first suffix; useEffect will process the next
                return prev.slice(1);
            }
            setLoading(false);
            setRollInput('');
            return [];
        });
    };
    // Remove useEffect and processingQueue logic, not needed for preview/submit flow

    // Remove processSingleSuffix and processNextSuffix logic

    const submitAttendance = async () => {
        if (markedStudents.length === 0) {
            setMessage({ text: 'No students marked for attendance', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/attendance/quick-submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    classId: classID,
                    subjectId: subjectID,
                    date: date.format('YYYY-MM-DD'),
                    markedStudents: markedStudents,
                    mode: mode
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // ...removed for production...

            if (data.success) {
                setMessage({ 
                    text: `Successfully submitted attendance for ${markedStudents.length} students`, 
                    type: 'success' 
                });
                setMarkedStudents([]);
                setRollInput('');
            } else {
                setMessage({ 
                    text: data.message || 'Failed to submit attendance', 
                    type: 'error' 
                });
            }
        } catch (error) {
            // ...removed for production...
            setMessage({ 
                text: `Failed to submit attendance: ${error.message}`, 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ 
            p: { xs: 2, sm: 3 }, 
            maxWidth: { xs: '100%', sm: 600 }, 
            mx: 'auto',
            overflowX: 'hidden' 
        }}>
            <Typography 
                variant="h5" 
                gutterBottom
                sx={{
                    fontSize: { xs: '1.5rem', sm: '1.8rem' },
                    textAlign: { xs: 'center', sm: 'left' }
                }}
            >
                Quick Attendance
            </Typography>

            {/* Class and Subject indicator */}
            <Paper
                elevation={1}
                sx={{
                    p: 1.5,
                    mb: 2,
                    backgroundColor: 'rgba(25, 118, 210, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Class:
                    </Typography>
                    <Chip 
                        label={selectedClass?.sclassName || 'No Class Selected'} 
                        color="primary" 
                        variant="outlined"
                        size="small"
                    />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Subject:
                    </Typography>
                    <Chip 
                        label={selectedSubject ? `${selectedSubject.subName} (${selectedSubject.subCode})` : 'No Subject Selected'} 
                        color="secondary" 
                        variant="outlined"
                        size="small"
                    />
                </Box>
                {subjectDetails && subjectDetails.isLab && (
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            Type:
                        </Typography>
                        <Chip 
                            label="Lab Subject" 
                            color="success" 
                            variant="outlined"
                            size="small"
                        />
                    </Box>
                )}
            </Paper>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label="Attendance Date"
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    format="DD/MM/YYYY"
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            margin: 'normal',
                            size: 'small'
                        }
                    }}
                />
            </LocalizationProvider>

            {/* Batch selection for lab subjects */}
            {subjectDetails && subjectDetails.isLab && subjectDetails.batches && (
                <FormControl 
                    fullWidth 
                    sx={{ 
                        mt: 3,
                        '& .MuiFormLabel-root': {
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                        }
                    }}
                >
                    <FormLabel sx={{ mb: 1 }}>Select Batch</FormLabel>
                    <RadioGroup
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { 
                                xs: '1fr', 
                                sm: subjectDetails.batches.length > 2 ? '1fr 1fr' : 'repeat(auto-fit, minmax(120px, 1fr))' 
                            },
                            gap: 1
                        }}
                        value={selectedBatch}
                        onChange={e => setSelectedBatch(e.target.value)}
                    >
                        {subjectDetails.batches.map((batch, idx) => (
                            <FormControlLabel
                                key={batch.batchName}
                                value={batch.batchName}
                                control={<Radio size="small" />}
                                label={batch.batchName}
                                sx={{
                                    mx: 0,
                                    py: 0.5,
                                    px: 1,
                                    borderRadius: 1,
                                    bgcolor: selectedBatch === batch.batchName ? 'action.selected' : 'transparent',
                                    '& .MuiFormControlLabel-label': {
                                        fontSize: { xs: '0.9rem', sm: '1rem' }
                                    }
                                }}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            )}

            <FormControl 
                sx={{ 
                    mt: 3, 
                    width: '100%',
                    '& .MuiFormLabel-root': {
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                    }
                }}
            >
                <FormLabel sx={{ mb: 1 }}>Attendance Mode</FormLabel>
                <RadioGroup
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 1
                    }}
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                >
                    <FormControlLabel 
                        value="present" 
                        control={<Radio size="small" />} 
                        label="Mark Present Students" 
                        sx={{
                            mx: 0,
                            py: 0.5,
                            px: 1,
                            borderRadius: 1,
                            bgcolor: mode === 'present' ? 'success.light' : 'transparent',
                            '& .MuiFormControlLabel-label': {
                                fontSize: { xs: '0.9rem', sm: '1rem' }
                            }
                        }}
                    />
                    <FormControlLabel 
                        value="absent" 
                        control={<Radio size="small" />} 
                        label="Mark Absent Students" 
                        sx={{
                            mx: 0,
                            py: 0.5,
                            px: 1,
                            borderRadius: 1,
                            bgcolor: mode === 'absent' ? 'error.light' : 'transparent',
                            '& .MuiFormControlLabel-label': {
                                fontSize: { xs: '0.9rem', sm: '1rem' }
                            }
                        }}
                    />
                </RadioGroup>
            </FormControl>

            <TextField
                fullWidth
                label="Enter last 2 digits of roll numbers"
                value={rollInput}
                onChange={(e) => setRollInput(e.target.value)}
                onKeyPress={handleRollInput}
                disabled={loading || (subjectDetails && subjectDetails.isLab && !selectedBatch)}
                size="small"
                sx={{ 
                    mt: 3,
                    '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                    },
                    '& .MuiInputBase-input': {
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        py: { xs: 1.5, sm: 1 }
                    }
                }}
                placeholder="For example: 41 01 02"
                helperText={
                    <Typography 
                        component="span" 
                        sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.8rem' },
                            color: 'text.secondary',
                            display: 'block',
                            mt: 0.5
                        }}
                    >
                        {subjectDetails && subjectDetails.isLab
                            ? "Select a batch and then enter roll numbers for that batch only"
                            : "Press Enter after typing numbers (separated by spaces)"}
                    </Typography>
                }
            />

            {message.text && (
                <Alert 
                    severity={message.type} 
                    sx={{ 
                        mt: 2,
                        '& .MuiAlert-message': {
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                        }
                    }}
                >
                    {message.text}
                </Alert>
            )}

            <Paper sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>
                    Quick Summary:
                </Typography>
                <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2
                }}>
                    <Typography variant="body2" sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        Mode: <span style={{ fontWeight: 'bold' }}>{mode}</span>
                    </Typography>
                    <Typography variant="body2" sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        Students: <span style={{ fontWeight: 'bold' }}>{markedStudents.length}</span>
                    </Typography>
                </Box>
                {markedStudents.length > 0 && (
                    <Box sx={{ 
                        mt: 2,
                        maxHeight: { xs: '150px', sm: '200px' },
                        overflowY: 'auto',
                        p: 1
                    }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Marked Students:
                        </Typography>
                        {markedStudents.map((student, idx) => (
                            <Typography 
                                key={idx} 
                                variant="body2" 
                                sx={{ 
                                    pl: 2,
                                    py: 0.5,
                                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                                    '&:last-child': { borderBottom: 'none' }
                                }}
                            >
                                • {student.name} (Roll: {student.rollNum})
                            </Typography>
                        ))}
                    </Box>
                )}
            </Paper>

            <Button
                variant="contained"
                color="primary"
                onClick={submitAttendance}
                sx={{ 
                    mt: 3,
                    width: '100%',
                    py: { xs: 1.5, sm: 1 },
                    fontSize: { xs: '1rem', sm: 'inherit' }
                }}
                disabled={markedStudents.length === 0 || loading || (subjectDetails && subjectDetails.isLab && !selectedBatch)}
            >
                Submit Attendance ({markedStudents.length} students)
            </Button>

            <Dialog 
                open={multipleMatches.length > 0} 
                onClose={() => {
                    setMultipleMatches([]);
                    processNextSuffix();
                }}
            >
                <DialogTitle>
                    Multiple Students Found
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Multiple students found with roll number ending in {currentSuffix}. 
                        Please select the correct student:
                    </Typography>
                    <List>
                        {multipleMatches.map((student, index) => (
                            <ListItem 
                                button 
                                key={index}
                                onClick={() => handleStudentSelection(student)}
                            >
                                <ListItemText 
                                    primary={`${student.name} (Roll: ${student.rollNum})`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => {
                            setMultipleMatches([]);
                            processNextSuffix();
                        }}
                    >
                        Skip
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuickAttendance;
