import React, { useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    CircularProgress,
    Card,
    CardContent,
    Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getClassDetails } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import CoordinatorSideBar from './CoordinatorSideBar';
import CustomBarChart from '../../components/CustomBarChart';
import CustomPieChart from '../../components/CustomPieChart';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';

const CoordinatorDashboard = () => {
    const navigate = useNavigate();
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

    const calculateStats = () => {
        if (!students) return null;

        const totalStudents = students.length;
        const activeStudents = students.filter(s => s.status === 'active').length;
        const averageAttendance = students.reduce((acc, student) => 
            acc + (student.attendance?.overallPercentage || 0), 0) / totalStudents;

        const monthlyData = {};
        students.forEach(student => {
            if (student.attendance?.monthly) {
                Object.entries(student.attendance.monthly).forEach(([month, value]) => {
                    if (!monthlyData[month]) monthlyData[month] = [];
                    monthlyData[month].push(value);
                });
            }
        });

        return {
            totalStudents,
            activeStudents,
            averageAttendance,
            monthlyAverages: Object.entries(monthlyData).map(([month, values]) => ({
                month,
                average: values.reduce((a, b) => a + b, 0) / values.length
            }))
        };
    };

    if (classLoading || studentsLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const stats = calculateStats();

    return (
        <Box sx={{ display: 'flex' }}>
            <CoordinatorSideBar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Typography variant="h4" gutterBottom>
                    Welcome, {currentUser?.name}
                </Typography>
                
                <Typography variant="h6" gutterBottom color="textSecondary">
                    Class Coordinator - {currentClass?.sclassName}
                </Typography>

                <Grid container spacing={3}>
                    {/* Quick Stats Cards */}
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography color="textSecondary" gutterBottom>
                                            Total Students
                                        </Typography>
                                        <Typography variant="h4">
                                            {stats?.totalStudents || 0}
                                        </Typography>
                                    </Box>
                                    <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                </Box>
                                <Button 
                                    sx={{ mt: 2 }} 
                                    variant="outlined" 
                                    fullWidth
                                    onClick={() => navigate('/coordinator/students')}
                                >
                                    View Students
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography color="textSecondary" gutterBottom>
                                            Average Attendance
                                        </Typography>
                                        <Typography variant="h4">
                                            {stats?.averageAttendance.toFixed(1)}%
                                        </Typography>
                                    </Box>
                                    <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                </Box>
                                <Button 
                                    sx={{ mt: 2 }} 
                                    variant="outlined" 
                                    fullWidth
                                    onClick={() => navigate('/coordinator/attendance-analysis')}
                                >
                                    View Analysis
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography color="textSecondary" gutterBottom>
                                            Generate Reports
                                        </Typography>
                                        <Typography variant="h4">
                                            Quick Access
                                        </Typography>
                                    </Box>
                                    <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                </Box>
                                <Button 
                                    sx={{ mt: 2 }} 
                                    variant="outlined" 
                                    fullWidth
                                    onClick={() => navigate('/coordinator/attendance-reports')}
                                >
                                    Generate Reports
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Charts */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Monthly Attendance Trends
                            </Typography>
                            {stats?.monthlyAverages && (
                                <CustomBarChart
                                    data={stats.monthlyAverages}
                                    XAxisKey="month"
                                    YAxisKey="average"
                                    barKey="average"
                                    tooltip="Average Attendance %"
                                />
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Recent Attendance Overview
                            </Typography>
                            <Box sx={{ minHeight: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {students?.slice(0, 5).map(student => (
                                    <Box key={student._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography>{student.name}</Typography>
                                        <Typography>
                                            {student.attendance?.overallPercentage 
                                                ? `${student.attendance.overallPercentage}%`
                                                : 'N/A'
                                            }
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default CoordinatorDashboard;
