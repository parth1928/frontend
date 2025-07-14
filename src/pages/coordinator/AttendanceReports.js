import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useDispatch, useSelector } from 'react-redux';
import { getClassDetails } from '../../redux/sclassRelated/sclassHandle';
import { getSubjectList } from '../../redux/subjectRelated/subjectHandle';

const AttendanceReports = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { currentClass, loading: classLoading } = useSelector((state) => state.sclass);
    const { subjectsList } = useSelector((state) => state.subject);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [downloading, setDownloading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: 'info' });

    useEffect(() => {
        if (currentUser?.assignedClass) {
            dispatch(getClassDetails(currentUser.assignedClass));
            dispatch(getSubjectList({ classId: currentUser.assignedClass }));
        }
    }, [dispatch, currentUser]);

    const downloadReport = async () => {
        setDownloading(true);
        setMessage({ text: '', type: 'info' });
        try {
            const baseUrl = process.env.REACT_APP_API_BASE_URL;
            let url = `${baseUrl}/Coordinator/attendance/download/${currentUser._id}`;
            if (selectedSubject !== 'all') {
                url += `?subject=${selectedSubject}`;
            }
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download report');
            }

            const blob = await response.blob();
            const url_download = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url_download;
            a.download = `attendance_report_${currentClass?.sclassName}_${selectedSubject === 'all' ? 'overall' : selectedSubject}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setMessage({ text: 'Report downloaded successfully', type: 'success' });
        } catch (error) {
            console.error('Error downloading report:', error);
            setMessage({ text: 'Failed to download report', type: 'error' });
        } finally {
            setDownloading(false);
        }
    };

    if (classLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Attendance Reports - {currentClass?.sclassName}
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>Select Subject</InputLabel>
                                <Select
                                    value={selectedSubject}
                                    label="Select Subject"
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                >
                                    <MenuItem value="all">All Subjects</MenuItem>
                                    {subjectsList.map((subject) => (
                                        <MenuItem key={subject._id} value={subject._id}>
                                            {subject.subjectName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={downloadReport}
                                disabled={downloading}
                            >
                                {downloading ? 'Downloading...' : 'Download Report'}
                            </Button>
                        </Box>

                        {message.text && (
                            <Alert severity={message.type}>
                                {message.text}
                            </Alert>
                        )}

                        <Typography variant="body1" sx={{ mt: 2 }}>
                            The downloaded report will include:
                            <ul>
                                <li>Student-wise attendance percentages</li>
                                <li>Subject-wise attendance breakdown (if all subjects selected)</li>
                                <li>Attendance trends and patterns</li>
                                <li>Students below attendance threshold</li>
                            </ul>
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AttendanceReports;
