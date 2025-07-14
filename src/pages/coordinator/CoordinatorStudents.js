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
    Alert
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getClassDetails } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import CoordinatorSideBar from './CoordinatorSideBar';

const CoordinatorStudents = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { currentClass, loading: classLoading } = useSelector((state) => state.sclass);
    const { userDetails: students, loading: studentsLoading, error } = useSelector((state) => state.student);
    const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

    useEffect(() => {
        if (currentUser?.assignedClass) {
            dispatch(getClassDetails(currentUser.assignedClass));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (currentClass?._id) {
            dispatch(getAllStudents(currentClass._id));
            setHasAttemptedLoad(true);
        }
    }, [dispatch, currentClass]);

    if (classLoading || (!hasAttemptedLoad && studentsLoading)) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex' }}>
                <CoordinatorSideBar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                    <Alert severity="error">
                        {error}
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
                    <Typography variant="h4" gutterBottom>
                        Students in {currentClass?.sclassName}
                    </Typography>
                    <Alert severity="info">
                        No students found in this class.
                    </Alert>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CoordinatorSideBar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Typography variant="h4" gutterBottom>
                    Students in {currentClass?.sclassName}
                </Typography>

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
