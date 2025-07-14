import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Button
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getClassDetails } from '../../redux/sclassRelated/sclassHandle';
import { getClassAttendanceStats } from '../../redux/studentRelated/studentHandle';
import CoordinatorSideBar from './CoordinatorSideBar';
import CustomBarChart from '../../components/CustomBarChart';
import SubjectWiseAttendanceTable from '../../components/SubjectWiseAttendanceTable';
import { BlueButton } from '../../components/buttonStyles';

const AttendanceAnalysis = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { currentClass, loading: classLoading } = useSelector((state) => state.sclass);
    const { studentsAttendance, loading: attendanceLoading, error } = useSelector((state) => state.student);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (currentUser?.assignedClass?._id) {
            dispatch(getClassDetails(currentUser.assignedClass));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (currentClass?._id) {
            dispatch(getClassAttendanceStats(currentClass._id));
        }
    }, [dispatch, currentClass]);

    const downloadExcel = async () => {
        if (!currentClass?._id) {
            alert('Class information is required');
            return;
        }

        setIsDownloading(true);
        try {
            const BACKEND_URL = process.env.REACT_APP_API_BASE_URL || 'https://backend-a2q3.onrender.com';
            const response = await fetch(
                `${BACKEND_URL}/coordinator/attendance/download/${currentClass._id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${currentUser?.token || ''}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to download attendance');
            }

            const blob = await response.blob();
            if (blob.type.includes('application/json')) {
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
            link.download = `attendance_report_${currentClass.sclassName}_${new Date().toISOString().slice(0,10)}.xlsx`;
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

    if (classLoading || attendanceLoading) {
        return (
            <Box sx={{ display: 'flex' }}>
                <CoordinatorSideBar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>Loading analysis...</Typography>
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
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                </Box>
            </Box>
        );
    }

    if (!studentsAttendance || !studentsAttendance.students || studentsAttendance.students.length === 0) {
        return (
            <Box sx={{ display: 'flex' }}>
                <CoordinatorSideBar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                    <Alert severity="info">No attendance data available for analysis.</Alert>
                </Box>
            </Box>
        );
    }

    // Calculate attendance ranges for above/below 75%
    const aboveTarget = studentsAttendance.students.filter(s => s.attendance.overallPercentage >= 75).length;
    const belowTarget = studentsAttendance.students.length - aboveTarget;

    // Subject-wise attendance data
    const subjectWiseData = studentsAttendance.students[0].attendance.subjectWise.map(sub => ({
        subject: sub.subject,
        average: studentsAttendance.students.reduce((acc, student) => {
            const subAttendance = student.attendance.subjectWise.find(s => s.subject === sub.subject);
            return acc + (subAttendance?.percentage || 0);
        }, 0) / studentsAttendance.students.length
    }));

    return (
        <Box sx={{ display: 'flex' }}>
            <CoordinatorSideBar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">
                        Attendance Analysis - {currentClass?.sclassName}
                    </Typography>
                    <BlueButton
                        onClick={downloadExcel}
                        disabled={isDownloading}
                    >
                        {isDownloading ? 'Downloading...' : 'Download Report'}
                    </BlueButton>
                </Box>

                <Grid container spacing={3}>
                    {/* Summary Cards */}
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Class Average
                                </Typography>
                                <Typography variant="h4">
                                    {studentsAttendance.classStats.averageAttendance}%
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Students
                                </Typography>
                                <Typography variant="h4">
                                    {studentsAttendance.classStats.totalStudents}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Above 75%
                                </Typography>
                                <Typography variant="h4" color="primary">
                                    {aboveTarget}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Below 75%
                                </Typography>
                                <Typography variant="h4" color="error">
                                    {belowTarget}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Subject-wise Analysis Chart */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, height: '400px' }}>
                            <Typography variant="h6" gutterBottom>
                                Subject-wise Analysis
                            </Typography>
                            <CustomBarChart
                                data={subjectWiseData}
                                XAxisKey="subject"
                                YAxisKey="average"
                                barKey="average"
                                tooltip="Average Attendance %"
                            />
                        </Paper>
                    </Grid>

                    {/* Subject-wise Attendance Table */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Subject-wise Attendance Details
                            </Typography>
                            <SubjectWiseAttendanceTable
                                students={studentsAttendance.students}
                                showPagination={true}
                            />
                        </Paper>
                    </Grid>

                    {/* Key Insights */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Key Insights
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Typography>
                                        • {aboveTarget} students have attendance above 75%
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography>
                                        • {belowTarget} students have attendance below 75%
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography>
                                        • Overall class performance: {
                                            studentsAttendance.classStats.averageAttendance >= 90 ? 'Excellent' :
                                            studentsAttendance.classStats.averageAttendance >= 75 ? 'Good' :
                                            studentsAttendance.classStats.averageAttendance >= 60 ? 'Average' : 'Needs Improvement'
                                        }
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default AttendanceAnalysis;
