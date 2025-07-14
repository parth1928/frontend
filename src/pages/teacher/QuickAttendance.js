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

const QuickAttendance = ({ classID, subjectID, batchName, disabled }) => {
    const dispatch = useDispatch();
    const { subjectDetails } = useSelector((state) => state.sclass);
    const [date, setDate] = useState(dayjs());
    const [mode, setMode] = useState('present');
    const [rollInput, setRollInput] = useState('');
    const [markedStudents, setMarkedStudents] = useState([]);
    const [message, setMessage] = useState({ text: '', type: 'info' });
    const [loading, setLoading] = useState(false);

    // Update this useEffect to handle subject details
    useEffect(() => {
        if (subjectID) {
            dispatch(getSubjectDetails(subjectID, 'Subject'));
        }
    }, [dispatch, subjectID]);

    const handleRollInput = async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (disabled || (subjectDetails?.isLab && !batchName)) {
                setMessage({ text: 'Please select a batch first', type: 'error' });
                return;
            }

            setLoading(true);
            setMessage({ text: '', type: 'info' });

            try {
                if (!classID || !subjectID) {
                    throw new Error('Class ID or Subject ID is missing');
                }

                // Split and clean input
                const suffixes = rollInput.trim()
                    .split(/[\s,]+/)
                    .filter(suffix => suffix.length > 0);

                if (suffixes.length === 0) {
                    setMessage({ text: 'Please enter roll number suffixes', type: 'error' });
                    return;
                }

                // Process each suffix
                for (let suffix of suffixes) {
                    let rollSuffixToSend = suffix;
                    if (!(typeof suffix === 'string' && (suffix[0] === 'D' || suffix[0] === 'd'))) {
                        rollSuffixToSend = suffix.padStart(2, '0');
                    }

                    const requestBody = {
                        classId: classID,
                        subjectId: subjectID,
                        date: date.format('YYYY-MM-DD'),
                        rollSuffix: rollSuffixToSend,
                        status: mode === 'present',
                        batchName: batchName || undefined // Only include if provided
                    };

                    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/attendance/quick-mark`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(requestBody)
                    });

                    const data = await response.json();

                    if (response.ok && data.success && data.student) {
                        if (!markedStudents.some(s => s.rollNum === data.student.rollNum)) {
                            setMarkedStudents(prev => [...prev, data.student]);
                            setMessage({
                                text: `Marked ${data.student.name} (Roll: ${data.student.rollNum}) as ${mode}`,
                                type: 'success'
                            });
                        }
                    } else {
                        throw new Error(data.message || 'Failed to mark attendance');
                    }
                }

                // Clear input after successful processing
                setRollInput('');
            } catch (error) {
                console.error('Error marking attendance:', error);
                setMessage({
                    text: `Error: ${error.message}`,
                    type: 'error'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const submitAttendance = async () => {
        if (markedStudents.length === 0) {
            setMessage({ text: 'No students marked for attendance', type: 'error' });
            return;
        }

        if (disabled || (subjectDetails?.isLab && !batchName)) {
            setMessage({ text: 'Please select a batch first', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const requestBody = {
                classId: classID,
                subjectId: subjectID,
                date: date.format('YYYY-MM-DD'),
                students: markedStudents.map(student => ({
                    studentId: student._id,
                    status: mode === 'present'
                })),
                batchName: batchName || undefined
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/attendance/quick-submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage({
                    text: `Successfully submitted attendance for ${markedStudents.length} students`,
                    type: 'success'
                });
                setMarkedStudents([]);
                setRollInput('');
            } else {
                throw new Error(data.message || 'Failed to submit attendance');
            }
        } catch (error) {
            console.error('Error submitting attendance:', error);
            setMessage({
                text: `Error: ${error.message}`,
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
                {subjectDetails?.isLab && !batchName && (
                    <Typography variant="caption" color="error" display="block">
                        Please select a batch first
                    </Typography>
                )}
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
                    disabled={disabled}
                />
            </LocalizationProvider>

            <FormControl sx={{ mt: 3, width: '100%' }}>
                <FormLabel>Attendance Mode</FormLabel>
                <RadioGroup
                    row
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                >
                    <FormControlLabel value="present" control={<Radio />} label="Mark Present Students" disabled={disabled} />
                    <FormControlLabel value="absent" control={<Radio />} label="Mark Absent Students" disabled={disabled} />
                </RadioGroup>
            </FormControl>

            <TextField
                fullWidth
                label="Enter last 2 digits of roll numbers"
                value={rollInput}
                onChange={(e) => setRollInput(e.target.value)}
                onKeyPress={handleRollInput}
                disabled={disabled || loading || (subjectDetails?.isLab && !batchName)}
                sx={{ mt: 3 }}
                placeholder="For example: 41 01 02"
                helperText={subjectDetails?.isLab ?
                    batchName ? `Enter roll numbers for batch ${batchName}` : "Select a batch first" :
                    "Press Enter after typing numbers (separated by spaces)"}
            />

            {message.text && (
                <Alert severity={message.type} sx={{ mt: 2 }}>
                    {message.text}
                </Alert>
            )}

            {markedStudents.length > 0 && (
                <Paper sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Students Marked:
                    </Typography>
                    {markedStudents.map((student, idx) => (
                        <Typography key={idx} variant="body2" sx={{ pl: 2 }}>
                            • {student.name} (Roll: {student.rollNum}) - {mode}
                        </Typography>
                    ))}
                </Paper>
            )}

            <Button
                variant="contained"
                color="primary"
                onClick={submitAttendance}
                sx={{ mt: 3 }}
                disabled={disabled || markedStudents.length === 0 || loading || (subjectDetails?.isLab && !batchName)}
            >
                {loading ? "Submitting..." : `Submit Attendance (${markedStudents.length} students)`}
            </Button>
        </Box>
    );
};

export default QuickAttendance;
