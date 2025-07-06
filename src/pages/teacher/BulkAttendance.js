import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateStudentFields } from '../../redux/studentRelated/studentHandle';
import { useParams, useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Switch,
    Button,
    FormControl,
    TextField,
    CircularProgress,
    Stack,
    styled
} from '@mui/material';
import { tableCellClasses } from '@mui/material/TableCell';
import { PurpleButton } from '../../components/buttonStyles';
import Popup from '../../components/Popup';
import { getClassStudents } from '../../redux/sclassRelated/sclassHandle';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        fontSize: 16,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));


const BulkAttendance = () => {
    const dispatch = useDispatch();
    const { sclassStudents, loading } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);
    const { subjectID, classID } = useParams();
    const location = useLocation();

    // Get batchName from query string (default empty)
    const queryParams = new URLSearchParams(location.search);
    const initialBatchName = queryParams.get('batch') || '';

    const [date, setDate] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [loader, setLoader] = useState(false);
    const [attendance, setAttendance] = useState({});
    const [subjectDetails, setSubjectDetails] = useState({});
    const [batchList, setBatchList] = useState([]);
    const [batchName, setBatchName] = useState(initialBatchName);
    const [isResetInProgress, setIsResetInProgress] = useState(false);

    // Always fetch subject details (with batches) on mount
    useEffect(() => {
        if (subjectID) {
            fetch(`${process.env.REACT_APP_API_BASE_URL}/subject/${subjectID}`)
                .then(res => res.json())
                .then(res => {
                    setSubjectDetails(res);
                    if (res.isLab && Array.isArray(res.batches)) {
                        setBatchList(res.batches);
                    } else {
                        setBatchList([]);
                    }
                })
                .catch(() => {
                    setSubjectDetails({});
                    setBatchList([]);
                });
        }
    }, [subjectID]);

    useEffect(() => {
        dispatch(getClassStudents(classID));
    }, [dispatch, classID]);

    // Filter students for selected batch if lab using useMemo
    const filteredStudents = React.useMemo(() => {
        if (subjectDetails.isLab && batchName) {
            return sclassStudents.filter(student =>
                batchList.find(b => b.batchName === batchName)?.students.includes(student._id)
            );
        }
        return !subjectDetails.isLab ? sclassStudents : [];
    }, [subjectDetails.isLab, batchName, sclassStudents, batchList]);

    useEffect(() => {
        // Initialize attendance state with all students marked as present when batch changes
        if (batchName || !subjectDetails.isLab) {
            setIsResetInProgress(true);
            const initialAttendance = {};
            filteredStudents.forEach(student => {
                initialAttendance[student._id] = true; // true = present, false = absent
            });
            setAttendance(initialAttendance);
            setIsResetInProgress(false);
        } else {
            setAttendance({});
        }
    }, [filteredStudents, batchName, subjectDetails.isLab]);

    const handleAttendanceChange = (studentId, checked) => {
        if (!isResetInProgress) {
            setAttendance(prev => ({
                ...prev,
                [studentId]: checked
            }));
        }
    };

    const markAllPresent = () => {
        const newAttendance = {};
        filteredStudents.forEach(student => {
            newAttendance[student._id] = true;
        });
        setAttendance(newAttendance);
    };

    const markAllAbsent = () => {
        const newAttendance = {};
        filteredStudents.forEach(student => {
            newAttendance[student._id] = false;
        });
        setAttendance(newAttendance);
    };

    const submitAttendance = async (e) => {
        e.preventDefault();
        setLoader(true);

        // Defensive: For lab, require batch selection
        if (subjectDetails.isLab && !batchName) {
            setLoader(false);
            setShowPopup(true);
            setMessage('Please select a batch for lab subject.');
            setSuccess(false);
            return;
        }

        try {
            // Only process attendance for filtered students (batch students for lab)
            for (const student of filteredStudents) {
                const fields = {
                    subName: currentUser.teachSubject._id,
                    status: attendance[student._id] ? 'Present' : 'Absent',
                    date
                };
                await dispatch(updateStudentFields(student._id, fields, 'StudentAttendance'));
            }

            setLoader(false);
            setShowPopup(true);
            setMessage('Attendance marked successfully!');
            setSuccess(true);
        } catch (error) {
            setLoader(false);
            setShowPopup(true);
            setMessage('Error marking attendance');
            setSuccess(false);
        }
    };

    return (
        <>
            {loading || (subjectID && !subjectDetails._id && !subjectDetails.isLab && !subjectDetails.subName) ? (
                <div>Loading subject details...</div>
            ) : (
                <Box sx={{ p: 3 }}>
                    <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 4 }}>
                        Bulk Attendance
                    </Typography>

                    <form onSubmit={submitAttendance}>
                        <Stack spacing={3} sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                <FormControl sx={{ width: '200px' }}>
                                    <TextField
                                        label="Select Date"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: 'rgba(0, 0, 0, 0.23)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'primary.main',
                                                },
                                            },
                                        }}
                                    />
                                </FormControl>
                                {/* Batch selector for lab subjects */}
                                {subjectDetails.isLab && batchList.length > 0 && (
                                    <FormControl sx={{ width: '200px' }}>
                                        <TextField
                                            select
                                            label="Select Batch"
                                            value={batchName}
                                            onChange={e => setBatchName(e.target.value)}
                                            SelectProps={{ native: true }}
                                            required
                                        >
                                            <option value="">-- Select Batch --</option>
                                            {batchList.map(batch => (
                                                <option key={batch.batchName} value={batch.batchName}>{batch.batchName}</option>
                                            ))}
                                        </TextField>
                                    </FormControl>
                                )}
                                <Button
                                    variant="contained"
                                    onClick={markAllPresent}
                                    sx={{
                                        bgcolor: '#4caf50',
                                        '&:hover': { bgcolor: '#388e3c' },
                                        px: 3,
                                        py: 1,
                                    }}
                                >
                                    Mark All Present
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={markAllAbsent}
                                    sx={{
                                        bgcolor: '#f44336',
                                        '&:hover': { bgcolor: '#d32f2f' },
                                        px: 3,
                                        py: 1,
                                    }}
                                >
                                    Mark All Absent
                                </Button>
                            </Box>
                        </Stack>

                        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, mb: 4 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>Name</StyledTableCell>
                                        <StyledTableCell>Roll Number</StyledTableCell>
                                        <StyledTableCell align="center">Attendance Status</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredStudents.map((student) => (
                                        <StyledTableRow key={student._id}>
                                            <StyledTableCell>{student.name}</StyledTableCell>
                                            <StyledTableCell>{student.rollNum}</StyledTableCell>
                                            <StyledTableCell align="center">
                                                <Switch
                                                    checked={!!attendance[student._id]}
                                                    onChange={(e) => handleAttendanceChange(student._id, e.target.checked)}
                                                    color="success"
                                                    disabled={loader}
                                                />
                                                <Typography component="span" sx={{ ml: 1, color: attendance[student._id] ? 'success.main' : 'error.main' }}>
                                                    {attendance[student._id] ? 'Present' : 'Absent'}
                                                </Typography>
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Show count of students marked present */}
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <Typography variant="subtitle1" color="success.main">
                                Marked Present: {Object.values(attendance).filter(Boolean).length} / {filteredStudents.length}
                            </Typography>
                        </Box>

                        <PurpleButton
                            fullWidth
                            size="large"
                            type="submit"
                            disabled={loader}
                            sx={{
                                mt: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                                fontWeight: 'medium'
                            }}
                        >
                            {loader ? <CircularProgress size={24} color="inherit" /> : "Submit Attendance"}
                        </PurpleButton>
                    </form>

                    <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} success={success} />
                </Box>
            )}
        </>
    );
};

export default BulkAttendance;