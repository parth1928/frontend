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
    ListItemText
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const QuickAttendance = ({ classID, subjectID }) => {
    const dispatch = useDispatch();
    const { subjectDetails } = useSelector((state) => state.sclass);
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
            console.error('Error marking selected student:', error);
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
            console.log('Submit response:', data);

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
            console.error('Error submitting attendance:', error);
            setMessage({ 
                text: `Failed to submit attendance: ${error.message}`, 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>
                Quick Attendance
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label="Attendance Date"
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    format="DD/MM/YYYY"
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            margin: 'normal'
                        }
                    }}
                />
            </LocalizationProvider>

            {/* Batch selection for lab subjects */}
            {subjectDetails && subjectDetails.isLab && subjectDetails.batches && (
                <FormControl fullWidth sx={{ mt: 3 }}>
                    <FormLabel>Select Batch</FormLabel>
                    <RadioGroup
                        row
                        value={selectedBatch}
                        onChange={e => setSelectedBatch(e.target.value)}
                    >
                        {subjectDetails.batches.map((batch, idx) => (
                            <FormControlLabel
                                key={batch.batchName}
                                value={batch.batchName}
                                control={<Radio />}
                                label={batch.batchName}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            )}

            <FormControl sx={{ mt: 3, width: '100%' }}>
                <FormLabel>Attendance Mode</FormLabel>
                <RadioGroup
                    row
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                >
                    <FormControlLabel value="present" control={<Radio />} label="Mark Present Students" />
                    <FormControlLabel value="absent" control={<Radio />} label="Mark Absent Students" />
                </RadioGroup>
            </FormControl>

            <TextField
                fullWidth
                label="Enter last 2 digits of roll numbers"
                value={rollInput}
                onChange={(e) => setRollInput(e.target.value)}
                onKeyPress={handleRollInput}
                disabled={loading || (subjectDetails && subjectDetails.isLab && !selectedBatch)}
                sx={{ mt: 3 }}
                placeholder="For example: 41 01 02"
                helperText={subjectDetails && subjectDetails.isLab ?
                    "Select a batch and then enter roll numbers for that batch only" :
                    "Press Enter after typing numbers (separated by spaces)"}
            />

            {message.text && (
                <Alert severity={message.type} sx={{ mt: 2 }}>
                    {message.text}
                </Alert>
            )}

            <Paper sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>
                    Debug Information:
                </Typography>
                <Typography variant="body2">
                    Class ID: {classID}
                </Typography>
                <Typography variant="body2">
                    Subject ID: {subjectID}
                </Typography>
                <Typography variant="body2">
                    Marked Students Count: {markedStudents.length}
                </Typography>
                <Typography variant="body2">
                    Current Mode: {mode}
                </Typography>
                <Typography variant="body2">
                    Submit Button State: {markedStudents.length === 0 ? 'Disabled' : 'Enabled'}
                </Typography>
                {markedStudents.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                            Marked Students:
                        </Typography>
                        {markedStudents.map((student, idx) => (
                            <Typography key={idx} variant="body2" sx={{ pl: 2 }}>
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
                sx={{ mt: 3 }}
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
