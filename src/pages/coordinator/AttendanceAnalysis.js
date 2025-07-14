import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getClassDetails } from '../../redux/sclassRelated/sclassHandle';
import { getStudentAttendance } from '../../redux/studentRelated/studentHandle';
import { getSubjectList } from '../../redux/subjectRelated/subjectHandle';
import CustomBarChart from '../../components/CustomBarChart';
import CustomPieChart from '../../components/CustomPieChart';

const AttendanceAnalysis = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { currentClass, loading: classLoading } = useSelector((state) => state.sclass);
    const { subjectsList } = useSelector((state) => state.subject);
    const { studentsAttendance, loading: attendanceLoading } = useSelector((state) => state.student);
    const [selectedSubject, setSelectedSubject] = useState('all');

    useEffect(() => {
        if (currentUser?.assignedClass) {
            dispatch(getClassDetails(currentUser.assignedClass));
            dispatch(getSubjectList({ classId: currentUser.assignedClass }));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (currentClass?._id) {
            dispatch(getStudentAttendance(currentClass._id));
        }
    }, [dispatch, currentClass]);

    if (classLoading || attendanceLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const getAttendanceData = () => {
        if (selectedSubject === 'all') {
            // Return overall attendance data
            const data = studentsAttendance.map(student => ({
                name: student.name,
                attendance: student.overallAttendance
            }));
            return data;
        } else {
            // Return subject-specific attendance data
            const data = studentsAttendance.map(student => ({
                name: student.name,
                attendance: student.attendance[selectedSubject] || 0
            }));
            return data;
        }
    };

    const getPieChartData = () => {
        const data = getAttendanceData();
        return [
            { name: '≥75%', value: data.filter(d => d.attendance >= 75).length },
            { name: '60-74%', value: data.filter(d => d.attendance >= 60 && d.attendance < 75).length },
            { name: '<60%', value: data.filter(d => d.attendance < 60).length }
        ];
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Attendance Analysis - {currentClass?.sclassName}
            </Typography>

            <Box sx={{ mb: 3 }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Select Subject</InputLabel>
                    <Select
                        value={selectedSubject}
                        label="Select Subject"
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        <MenuItem value="all">Overall</MenuItem>
                        {subjectsList.map((subject) => (
                            <MenuItem key={subject._id} value={subject._id}>
                                {subject.subjectName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Student-wise Attendance
                        </Typography>
                        <CustomBarChart
                            data={getAttendanceData()}
                            xDataKey="name"
                            barDataKey="attendance"
                            yAxisLabel="Attendance %"
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Attendance Distribution
                        </Typography>
                        <CustomPieChart data={getPieChartData()} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AttendanceAnalysis;
