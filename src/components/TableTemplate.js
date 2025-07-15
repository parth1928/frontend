import React, { useState } from 'react'
import { StyledTableCell, StyledTableRow } from './styles';
import { Paper, Table, TableBody, TableContainer, TableHead, TableRow, TablePagination } from '@mui/material';
import { Box } from '@mui/material';

const TableTemplate = ({ fields = [], data = [], hasCheckBox = false }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <Paper sx={{ width: '100%', mb: 2, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {fields.map((field) => (
                                    <StyledTableCell key={field}>{field}</StyledTableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => (
                                    <StyledTableRow key={index}>
                                        {Object.values(row).map((value, i) => (
                                            <StyledTableCell key={i}>{value}</StyledTableCell>
                                        ))}
                                    </StyledTableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                        '.MuiTablePagination-select': {
                            border: '1px solid rgba(0, 0, 0, 0.12)',
                            borderRadius: '4px',
                            padding: '4px',
                        },
                        '.MuiTablePagination-actions': {
                            marginLeft: 2,
                        },
                    }}
                />
            </Paper>
        </Box>
    );
};

export default TableTemplate;