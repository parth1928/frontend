import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getClassDetails } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import CoordinatorSideBar from './CoordinatorSideBar';
import DownloadIcon from '@mui/icons-material/Download';

const AttendanceReports = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { currentClass, loading: classLoading } = useSelector((state) => state.sclass);
    const { userDetails: students, loading: studentsLoading } = useSelector((state) => state.user);

    const [reportType, setReportType] = useState('monthly');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        if (currentUser?.assignedClass) {
            dispatch(getClassDetails(currentUser.assignedClass));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (currentClass?._id) {
            dispatch(getAllStudents(currentClass._id));
        }
    }, [dispatch, currentClass]);

    const generateReport = () => {
        if (!students) return;

        let data = [];
        if (reportType === 'monthly' && selectedMonth) {
            data = students.map(student => ({
                rollNum: student.rollNum,
                name: student.name,
                attendance: student.attendance?.monthly?.[selectedMonth] || 0,
                status: student.status || 'active'
            }));
        } else if (reportType === 'overall') {
            data = students.map(student => ({
                rollNum: student.rollNum,
                name: student.name,
                attendance: student.attendance?.overallPercentage || 0,
                status: student.status || 'active'
            }));
        }

        setReportData(data);
    };

    const downloadReport = () => {
        if (!reportData) return;

        const csvContent = [
            ['Roll Number', 'Name', 'Attendance %', 'Status'],
            ...reportData.map(student => [
                student.rollNum,
                student.name,
                student.attendance,
                student.status
            ])
        ].map(row => row.join(',')).join('\\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `attendance_report_${reportType}_${selectedMonth || 'overall'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (classLoading || studentsLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CoordinatorSideBar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Typography variant="h4" gutterBottom>
                    Attendance Reports - {currentClass?.sclassName}
                </Typography>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Report Type</InputLabel>
                                <Select
                                    value={reportType}
                                    label="Report Type"
                                    onChange={(e) => setReportType(e.target.value)}
                                >
                                    <MenuItem value="monthly">Monthly Report</MenuItem>
                                    <MenuItem value="overall">Overall Report</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {reportType === 'monthly' && (
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Month</InputLabel>
                                    <Select
                                        value={selectedMonth}
                                        label="Month"
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                    >
                                        {['January', 'February', 'March', 'April', 'May', 'June', 
                                          'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                                            <MenuItem key={month} value={month.toLowerCase()}>{month}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        <Grid item xs={12} md={4}>
                            <Button 
                                variant="contained" 
                                onClick={generateReport}
                                disabled={reportType === 'monthly' && !selectedMonth}
                                fullWidth
                            >
                                Generate Report
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {reportData && (
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">
                                Report Results
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={downloadReport}
                            >
                                Download CSV
                            </Button>
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Roll Number</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Attendance %</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData.map((student) => (
                                        <TableRow key={student.rollNum}>
                                            <TableCell>{student.rollNum}</TableCell>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{student.attendance}%</TableCell>
                                            <TableCell>{student.status}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default AttendanceReports;
