import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Button,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getClassAttendanceStats } from '../../redux/studentRelated/studentHandle';
import CoordinatorSideBar from './CoordinatorSideBar';
import SubjectWiseAttendanceTable from '../../components/SubjectWiseAttendanceTable';
import DownloadIcon from '@mui/icons-material/Download';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import axios from '../../api/axiosInstance';

const AttendanceReports = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { currentClass } = useSelector((state) => state.sclass);
    const { studentsAttendance, loading, error } = useSelector((state) => state.student);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [reportType, setReportType] = useState('overall');
    const [downloading, setDownloading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');

    useEffect(() => {
        if (currentClass?._id) {
            dispatch(getClassAttendanceStats(currentClass._id));
        }
    }, [dispatch, currentClass]);

    const handleDownload = async () => {
        if (!currentClass?._id) {
            setDialogMessage('No class selected');
            setShowDialog(true);
            return;
        }

        try {
            setDownloading(true);

            let url = `${process.env.REACT_APP_API_BASE_URL}/coordinator/attendance/report/${currentClass._id}`;
            const queryParams = [];

            if (reportType === 'date-range' && startDate && endDate) {
                queryParams.push(`startDate=${startDate.toISOString()}`);
                queryParams.push(`endDate=${endDate.toISOString()}`);
            }
            queryParams.push(`type=${reportType}`);

            if (queryParams.length > 0) {
                url += '?' + queryParams.join('&');
            }

            const response = await axios.get(url, {
                responseType: 'blob',
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });

            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `attendance_report_${currentClass.sclassName}_${new Date().toISOString().slice(0,10)}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setDialogMessage('Report downloaded successfully!');
            setShowDialog(true);
        } catch (error) {
            console.error('Download error:', error);
            setDialogMessage(error.response?.data?.message || 'Failed to download report');
            setShowDialog(true);
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex' }}>
                <CoordinatorSideBar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>Loading attendance data...</Typography>
                    </Box>
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex' }}>
                <CoordinatorSideBar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CoordinatorSideBar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Typography variant="h4" gutterBottom>
                    Attendance Reports
                </Typography>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Download Reports
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Report Type"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <MenuItem value="overall">Overall Attendance</MenuItem>
                                <MenuItem value="monthly">Monthly Report</MenuItem>
                                <MenuItem value="date-range">Custom Date Range</MenuItem>
                                <MenuItem value="subject-wise">Subject-wise Report</MenuItem>
                            </TextField>
                        </Grid>

                        {reportType === 'date-range' && (
                            <>
                                <Grid item xs={12} md={3}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                            label="Start Date"
                                            value={startDate}
                                            onChange={setStartDate}
                                            format="dd/MM/yyyy"
                                            slotProps={{
                                                textField: { fullWidth: true }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                            label="End Date"
                                            value={endDate}
                                            onChange={setEndDate}
                                            format="dd/MM/yyyy"
                                            slotProps={{
                                                textField: { fullWidth: true }
                                            }}
                                            minDate={startDate}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownload}
                                disabled={downloading || (reportType === 'date-range' && (!startDate || !endDate))}
                            >
                                {downloading ? 'Downloading...' : 'Download Report'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Current Attendance Summary
                    </Typography>

                    {studentsAttendance?.students && studentsAttendance.students.length > 0 ? (
                        <SubjectWiseAttendanceTable students={studentsAttendance.students} />
                    ) : (
                        <Alert severity="info">No attendance data available</Alert>
                    )}
                </Paper>

                <Dialog
                    open={showDialog}
                    onClose={() => setShowDialog(false)}
                >
                    <DialogTitle>
                        {dialogMessage.includes('error') || dialogMessage.includes('fail') 
                            ? 'Error' 
                            : 'Success'
                        }
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            {dialogMessage}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowDialog(false)}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default AttendanceReports;
