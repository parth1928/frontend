import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Typography,
    Box
} from '@mui/material';

const SubjectWiseAttendanceTable = ({ students, showPagination = true }) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    if (!students || students.length === 0) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography>No attendance data available</Typography>
            </Box>
        );
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Get all unique subjects
    const subjects = students[0].attendance.subjectWise.map(s => s.subject);

    const rows = students
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((student) => ({
            rollNum: student.rollNum,
            name: student.name,
            ...student.attendance.subjectWise.reduce((acc, sub) => {
                acc[sub.subject] = sub.percentage;
                return acc;
            }, {}),
            overallPercentage: student.attendance.overallPercentage
        }));

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Roll No</TableCell>
                            <TableCell>Name</TableCell>
                            {subjects.map((subject, index) => (
                                <TableCell key={index}>{subject}</TableCell>
                            ))}
                            <TableCell>Overall %</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{row.rollNum}</TableCell>
                                <TableCell>{row.name}</TableCell>
                                {subjects.map((subject, idx) => (
                                    <TableCell key={idx}>
                                        <Box
                                            sx={{
                                                color: row[subject] >= 75 ? 'success.main' :
                                                    row[subject] >= 60 ? 'warning.main' : 'error.main'
                                            }}
                                        >
                                            {row[subject]}%
                                        </Box>
                                    </TableCell>
                                ))}
                                <TableCell>
                                    <Box
                                        sx={{
                                            color: row.overallPercentage >= 75 ? 'success.main' :
                                                row.overallPercentage >= 60 ? 'warning.main' : 'error.main',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {row.overallPercentage}%
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {/* Average Row */}
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>
                                Class Average
                            </TableCell>
                            {subjects.map((subject, idx) => {
                                const avg = rows.reduce((acc, row) => acc + row[subject], 0) / rows.length;
                                return (
                                    <TableCell key={idx} sx={{ fontWeight: 'bold' }}>
                                        <Box
                                            sx={{
                                                color: avg >= 75 ? 'success.main' :
                                                    avg >= 60 ? 'warning.main' : 'error.main'
                                            }}
                                        >
                                            {Math.round(avg)}%
                                        </Box>
                                    </TableCell>
                                );
                            })}
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                <Box
                                    sx={{
                                        color: (rows.reduce((acc, row) => acc + row.overallPercentage, 0) / rows.length) >= 75 ? 'success.main' :
                                            (rows.reduce((acc, row) => acc + row.overallPercentage, 0) / rows.length) >= 60 ? 'warning.main' : 'error.main'
                                    }}
                                >
                                    {Math.round(rows.reduce((acc, row) => acc + row.overallPercentage, 0) / rows.length)}%
                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            {showPagination && (
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={students.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            )}
        </Paper>
    );
};

export default SubjectWiseAttendanceTable;
