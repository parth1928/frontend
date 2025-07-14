import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Button
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getClassDetails } from '../../redux/sclassRelated/sclassHandle';
import { getStudentList } from '../../redux/studentRelated/studentHandle';
import CoordinatorSideBar from './CoordinatorSideBar';
import RefreshIcon from '@mui/icons-material/Refresh';

const CoordinatorStudents = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { currentClass, loading: classLoading } = useSelector((state) => state.sclass);
    const { studentsList: students, loading: studentsLoading, error } = useSelector((state) => state.student);
    const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

    const loadData = () => {
        if (currentUser?.assignedClass?._id) {
            console.log('Loading data for class:', currentUser.assignedClass);
            dispatch(getClassDetails(currentUser.assignedClass));
            setHasAttemptedLoad(true);
        }
    };

    useEffect(() => {
        loadData();
    }, [currentUser]);

    useEffect(() => {
        if (currentClass?._id) {
            console.log('Fetching students for class:', currentClass._id);
            dispatch(getStudentList(currentClass._id));
        }
    }, [currentClass]);

    // Debug logging for state changes
    useEffect(() => {
        console.log('Component State:', {
            currentUser,
            currentClass,
            students,
            loading: { classLoading, studentsLoading },
            error
        });
    }, [currentUser, currentClass, students, classLoading, studentsLoading, error]);

    const handleRefresh = () => {
        loadData();
    };

    if (classLoading || (!hasAttemptedLoad && studentsLoading)) {
        return (
            <Box sx={{ display: 'flex' }}>
                <CoordinatorSideBar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>Loading data...</Typography>
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
                        Error loading data: {error}
                    </Alert>
                    <Button 
                        variant="contained" 
                        onClick={handleRefresh}
                        startIcon={<RefreshIcon />}
                    >
                        Retry Loading Data
                    </Button>
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

    if (!students || students.length === 0) {
        return (
            <Box sx={{ display: 'flex' }}>
                <CoordinatorSideBar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4">
                            Students in {currentClass?.sclassName}
                        </Typography>
                        <Button 
                            variant="contained" 
                            onClick={handleRefresh}
                            startIcon={<RefreshIcon />}
                        >
                            Refresh
                        </Button>
                    </Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        No students found in this class. This could mean either:
                    </Alert>
                    <Typography component="div">
                        <ul>
                            <li>No students have been added to this class yet</li>
                            <li>There might be an issue with the data connection</li>
                            <li>The class might not be properly assigned</li>
                        </ul>
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        Class Details:
                        <ul>
                            <li>Class Name: {currentClass?.sclassName}</li>
                            <li>Class ID: {currentClass?._id}</li>
                        </ul>
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CoordinatorSideBar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4">
                        Students in {currentClass?.sclassName}
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={handleRefresh}
                        startIcon={<RefreshIcon />}
                    >
                        Refresh
                    </Button>
                </Box>

                <Paper sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Class Statistics
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 4 }}>
                            <Typography>
                                Total Students: {students?.length || 0}
                            </Typography>
                            <Typography>
                                Active Students: {students?.filter(s => s.status === 'active')?.length || 0}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Roll Number</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Overall Attendance</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students?.map((student) => (
                                <TableRow key={student._id}>
                                    <TableCell>{student.rollNum}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell>{student.status || 'active'}</TableCell>
                                    <TableCell>
                                        {student.attendance?.overallPercentage !== undefined 
                                            ? `${student.attendance.overallPercentage}%`
                                            : 'N/A'
                                        }
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default CoordinatorStudents;
