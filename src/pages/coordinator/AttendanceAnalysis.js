import React, { useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Card,
    CardContent
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getClassDetails } from '../../redux/sclassRelated/sclassHandle';
import { getClassAttendanceStats } from '../../redux/studentRelated/studentHandle';
import CoordinatorSideBar from './CoordinatorSideBar';
import CustomBarChart from '../../components/CustomBarChart';
import CustomPieChart from '../../components/CustomPieChart';

const AttendanceAnalysis = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { currentClass, loading: classLoading } = useSelector((state) => state.sclass);
    const { studentsAttendance, loading: attendanceLoading, error } = useSelector((state) => state.student);

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

    // Calculate attendance ranges
    const attendanceRanges = {
        '90-100%': studentsAttendance.students.filter(s => s.attendance.overallPercentage >= 90).length,
        '80-89%': studentsAttendance.students.filter(s => s.attendance.overallPercentage >= 80 && s.attendance.overallPercentage < 90).length,
        '70-79%': studentsAttendance.students.filter(s => s.attendance.overallPercentage >= 70 && s.attendance.overallPercentage < 80).length,
        '60-69%': studentsAttendance.students.filter(s => s.attendance.overallPercentage >= 60 && s.attendance.overallPercentage < 70).length,
        'Below 60%': studentsAttendance.students.filter(s => s.attendance.overallPercentage < 60).length
    };

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
                <Typography variant="h4" gutterBottom>
                    Attendance Analysis - {currentClass?.sclassName}
                </Typography>

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
                                <Typography variant="h4">
                                    {attendanceRanges['90-100%'] + attendanceRanges['80-89%']}
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
                                <Typography variant="h4">
                                    {attendanceRanges['70-79%'] + attendanceRanges['60-69%'] + attendanceRanges['Below 60%']}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Charts */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: '100%' }}>
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

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                Attendance Distribution
                            </Typography>
                            <CustomPieChart
                                data={Object.entries(attendanceRanges).map(([range, count]) => ({
                                    name: range,
                                    value: count
                                }))}
                                dataKey="value"
                                nameKey="name"
                            />
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Key Insights
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Typography>
                                        • {attendanceRanges['90-100%']} students have excellent attendance (90-100%)
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography>
                                        • {attendanceRanges['Below 60%']} students need improvement (Below 60%)
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
