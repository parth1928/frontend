import React, { useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    CircularProgress,
    Card,
    CardContent,
    Button,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getClassDetails } from '../../redux/sclassRelated/sclassHandle';
import { getClassAttendanceStats } from '../../redux/studentRelated/studentHandle';
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
    const { studentsAttendance, loading: attendanceLoading, error } = useSelector((state) => state.student);

    useEffect(() => {
        if (currentUser?.assignedClass?._id) {
            console.log('Fetching class details for:', currentUser.assignedClass);
            dispatch(getClassDetails(currentUser.assignedClass));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (currentClass?._id) {
            console.log('Fetching attendance stats for class:', currentClass._id);
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
                        <Typography sx={{ ml: 2 }}>Loading dashboard data...</Typography>
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

    if (!currentClass) {
        return (
            <Box sx={{ display: 'flex' }}>
                <CoordinatorSideBar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                    <Alert severity="warning">
                        No class is currently assigned to you.
                    </Alert>
                </Box>
            </Box>
        );
    }

    const stats = studentsAttendance?.classStats || {
        totalStudents: 0,
        averageAttendance: 0,
        subjects: []
    };

    // Prepare data for charts
    const attendanceData = studentsAttendance?.students?.map(student => ({
        name: student.name,
        attendance: student.attendance.overallPercentage
    })) || [];

    const subjectWiseData = studentsAttendance?.students?.[0]?.attendance?.subjectWise?.map(sub => ({
        subject: sub.subject,
        average: studentsAttendance.students.reduce((acc, student) => {
            const subAttendance = student.attendance.subjectWise.find(s => s.subject === sub.subject);
            return acc + (subAttendance?.percentage || 0);
        }, 0) / studentsAttendance.students.length
    })) || [];

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
                                            {stats.totalStudents}
                                        </Typography>
                                    </Box>
                                    <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                </Box>
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
                                            {stats.averageAttendance}%
                                        </Typography>
                                    </Box>
                                    <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography color="textSecondary" gutterBottom>
                                            Total Subjects
                                        </Typography>
                                        <Typography variant="h4">
                                            {stats.subjects?.length || 0}
                                        </Typography>
                                    </Box>
                                    <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Charts */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Subject-wise Average Attendance
                            </Typography>
                            {subjectWiseData.length > 0 ? (
                                <CustomBarChart
                                    data={subjectWiseData}
                                    XAxisKey="subject"
                                    YAxisKey="average"
                                    barKey="average"
                                    tooltip="Average Attendance %"
                                />
                            ) : (
                                <Typography color="textSecondary">No attendance data available</Typography>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Top 5 Students by Attendance
                            </Typography>
                            {attendanceData.length > 0 ? (
                                <Box sx={{ height: 300 }}>
                                    {[...attendanceData]
                                        .sort((a, b) => b.attendance - a.attendance)
                                        .slice(0, 5)
                                        .map((student, index) => (
                                            <Box key={index} sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                mb: 1,
                                                p: 1,
                                                bgcolor: 'background.default',
                                                borderRadius: 1
                                            }}>
                                                <Typography>{student.name}</Typography>
                                                <Typography color="primary">{student.attendance}%</Typography>
                                            </Box>
                                        ))}
                                </Box>
                            ) : (
                                <Typography color="textSecondary">No student data available</Typography>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default CoordinatorDashboard;
