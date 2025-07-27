import React, { useEffect, useState } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Button,
    Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import axios from '../../../api/axiosInstance';
import { BlueButton } from '../../../components/buttonStyles';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const StyledTableCell = styled(TableCell)(({ theme, attendance }) => ({
    color: attendance < 50 ? 'red' : 'inherit',
}));

const AttendanceOverview = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const [attendanceData, setAttendanceData] = useState({ students: [], subjects: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const response = await axios.get(`/Coordinator/attendance/${currentUser._id}`);
                setAttendanceData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching attendance data:', error);
                setLoading(false);
            }
        };

        fetchAttendanceData();
    }, [currentUser._id]);

    const downloadReport = async () => {
        try {
            const response = await axios.get(`/Coordinator/attendance/download/${currentUser._id}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'attendance_report.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading report:', error);
        }
    };

    if (loading) {
        return <Typography>Loading attendance data...</Typography>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Class Attendance Overview
                </Typography>
                <BlueButton
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    onClick={downloadReport}
                >
                    Download Report
                </BlueButton>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Roll No</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Type</TableCell>
                            {attendanceData.subjects.map((subject) => (
                                <TableCell key={subject}>{subject}</TableCell>
                            ))}
                            <TableCell>Total Attendance</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {attendanceData.students.map((student) => (
                            <TableRow key={student._id}>
                                <TableCell>{student.rollNum}</TableCell>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>{student.type || 'Regular'}</TableCell>
                                {attendanceData.subjects.map((subject) => (
                                    <StyledTableCell
                                        key={subject}
                                        attendance={student.attendance?.subjects[subject]?.percentage || 0}
                                    >
                                        {(student.attendance?.subjects[subject]?.percentage || 0).toFixed(1)}%
                                    </StyledTableCell>
                                ))}
                                <StyledTableCell attendance={student.attendance?.overallPercentage || 0}>
                                    {(student.attendance?.overallPercentage || 0).toFixed(1)}%
                                </StyledTableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AttendanceOverview;
