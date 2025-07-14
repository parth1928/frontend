import React, { useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    CircularProgress
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getClassDetails } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import CoordinatorSideBar from './CoordinatorSideBar';
import CustomBarChart from '../../components/CustomBarChart';
import CustomPieChart from '../../components/CustomPieChart';

const AttendanceAnalysis = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { currentClass, loading: classLoading } = useSelector((state) => state.sclass);
    const { userDetails: students, loading: studentsLoading } = useSelector((state) => state.user);

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

    const calculateAttendanceStats = () => {
        if (!students || !Array.isArray(students) || students.length === 0) return null;

        const attendanceRanges = {
            '90-100%': 0,
            '80-89%': 0,
            '70-79%': 0,
            '60-69%': 0,
            'Below 60%': 0
        };

        const monthlyData = {};

        students.forEach(student => {
            if (!student) return;

            // Overall attendance calculation
            const attendance = student.attendance?.overallPercentage || 0;
            if (attendance >= 90) attendanceRanges['90-100%']++;
            else if (attendance >= 80) attendanceRanges['80-89%']++;
            else if (attendance >= 70) attendanceRanges['70-79%']++;
            else if (attendance >= 60) attendanceRanges['60-69%']++;
            else attendanceRanges['Below 60%']++;

            // Monthly attendance calculation
            if (student.attendance?.monthly) {
                Object.entries(student.attendance.monthly).forEach(([month, value]) => {
                    if (!monthlyData[month]) monthlyData[month] = [];
                    monthlyData[month].push(value);
                });
            }
        });

        const monthlyAverages = Object.entries(monthlyData).map(([month, values]) => ({
            subject: month.charAt(0).toUpperCase() + month.slice(1), // Capitalize first letter
            attendancePercentage: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
            totalClasses: values.length,
            attendedClasses: values.filter(v => v > 0).length
        }));

        return {
            attendanceRanges,
            monthlyAverages
        };
    };

    if (classLoading || studentsLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const stats = calculateAttendanceStats();

    // Don't render if no stats available
    if (!stats) {
        return (
            <Box sx={{ display: 'flex' }}>
                <CoordinatorSideBar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                    <Typography variant="h4" gutterBottom>
                        Attendance Analysis - {currentClass?.sclassName}
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                        <Typography>
                            No attendance data available.
                        </Typography>
                    </Paper>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CoordinatorSideBar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Typography variant="h4" gutterBottom>
                    Attendance Analysis - {currentClass?.sclassName}
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                Attendance Distribution
                            </Typography>
                            <CustomPieChart
                                data={Object.entries(stats.attendanceRanges).map(([range, count]) => ({
                                    name: range,
                                    value: count
                                }))}
                            />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                Monthly Attendance Trends
                            </Typography>
                            <CustomBarChart
                                chartData={stats.monthlyAverages}
                                dataKey="attendancePercentage"
                            />
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Key Insights
                            </Typography>
                            <Box>
                                <Typography>
                                    • {stats.attendanceRanges['90-100%']} students have excellent attendance (90-100%)
                                </Typography>
                                <Typography>
                                    • {stats.attendanceRanges['Below 60%']} students need attendance improvement (Below 60%)
                                </Typography>
                                <Typography>
                                    • Total students analyzed: {students.length}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default AttendanceAnalysis;
