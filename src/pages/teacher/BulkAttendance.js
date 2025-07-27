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
    const params = useParams();
    const classID = params.classID;
    const subjectID = params.subjectID;
    const location = useLocation();

    // Validate required IDs
    React.useEffect(() => {
        if (!classID || !subjectID) {
            // ...removed for production...
        }
    }, [classID, subjectID]);

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
        // Only fetch students if we have a valid classID
        if (!classID || classID === 'undefined' || classID === 'null') {
            return;
        }

        // Get adminId from currentUser's school
        const adminId = currentUser?.school?._id;

        // Always pass the adminId to get both regular and D2D students
        dispatch(getClassStudents(classID, adminId));
    }, [dispatch, classID, currentUser]);

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

        // Validate all required data
        if (!currentUser?.teachSubjects || currentUser.teachSubjects.length === 0) {
            setLoader(false);
            setShowPopup(true);
            setMessage('Teacher subject information is missing.');
            setSuccess(false);
            return;
        }

        // Check if current subject is in teacher's assigned subjects
        if (!currentUser.teachSubjects.some(sub => sub._id === subjectID)) {
            setLoader(false);
            setShowPopup(true);
            setMessage('You are not assigned to this subject.');
            setSuccess(false);
            return;
        }

        if (!classID || !subjectID) {
            setLoader(false);
            setShowPopup(true);
            setMessage('Class or subject information is missing.');
            setSuccess(false);
            return;
        }

        // Defensive: For lab, require batch selection
        if (subjectDetails.isLab && !batchName) {
            setLoader(false);
            setShowPopup(true);
            setMessage('Please select a batch for lab subject.');
            setSuccess(false);
            return;
        }

        try {
            // Prepare attendanceList for bulk API
            const attendanceList = filteredStudents.map(student => ({
                studentId: student._id,
                isDtod: student.role === 'D2D' || student.isDtod,
                date,
                status: attendance[student._id] ? 'Present' : 'Absent',
                subName: subjectID
            }));

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/attendance/bulk-mark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify({ attendanceList })
            });

            const data = await response.json();
            if (response.ok && data.message) {
                setLoader(false);
                setShowPopup(true);
                setMessage('Attendance marked successfully!');
                setSuccess(true);
            } else {
                setLoader(false);
                setShowPopup(true);
                setMessage(data.message || 'Error marking attendance');
                setSuccess(false);
            }
        } catch (error) {
            setLoader(false);
            setShowPopup(true);
            setMessage('Error marking attendance');
            setSuccess(false);
        }
    };

    return (
        <>
            {loading || !classID || (subjectID && !subjectDetails._id && !subjectDetails.isLab && !subjectDetails.subName) ? (
                <div>Loading subject details... {!classID ? "Missing class ID" : ""}</div>
            ) : (
                <Box sx={{ 
                    p: { xs: 2, sm: 3 },
                    maxWidth: '100%',
                    overflowX: 'hidden'
                }}>
                    <Typography 
                        variant="h4" 
                        gutterBottom 
                        sx={{ 
                            color: 'primary.main', 
                            mb: 4,
                            fontSize: { xs: '1.5rem', sm: '2rem' },
                            textAlign: { xs: 'center', sm: 'left' }
                        }}
                    >
                        Bulk Attendance
                    </Typography>

                    <form onSubmit={submitAttendance}>
                        <Stack spacing={2} sx={{ mb: 4 }}>
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: { xs: 2, sm: 2 },
                                alignItems: { xs: 'stretch', sm: 'center' },
                                mb: 2 
                            }}>
                                <FormControl sx={{ width: { xs: '100%', sm: '200px' } }}>
                                    <TextField
                                        label="Select Date"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                        size="small"
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
                                    <FormControl sx={{ width: { xs: '100%', sm: '200px' } }}>
                                        <TextField
                                            select
                                            label="Select Batch"
                                            value={batchName}
                                            onChange={e => setBatchName(e.target.value)}
                                            SelectProps={{ native: true }}
                                            required
                                            size="small"
                                        >
                                            <option value="">-- Select Batch --</option>
                                            {batchList.map(batch => (
                                                <option key={batch.batchName} value={batch.batchName}>{batch.batchName}</option>
                                            ))}
                                        </TextField>
                                    </FormControl>
                                )}
                            </Box>
                            <Box sx={{ 
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                gap: 2
                            }}>
                                <Button
                                    variant="contained"
                                    onClick={markAllPresent}
                                    sx={{
                                        bgcolor: '#4caf50',
                                        '&:hover': { bgcolor: '#388e3c' },
                                        py: { xs: 1.5, sm: 1 },
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
                                        py: { xs: 1.5, sm: 1 },
                                    }}
                                >
                                    Mark All Absent
                                </Button>
                            </Box>
                        </Stack>

                        <TableContainer 
                            component={Paper} 
                            sx={{ 
                                boxShadow: 3, 
                                borderRadius: 2, 
                                mb: 4,
                                overflow: 'auto',
                                maxHeight: { xs: '50vh', sm: '60vh' }
                            }}
                        >
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell 
                                            sx={{ 
                                                minWidth: { xs: '120px', sm: '150px' },
                                                fontSize: { xs: '0.875rem', sm: '1rem' }
                                            }}
                                        >
                                            Name
                                        </StyledTableCell>
                                        <StyledTableCell 
                                            sx={{ 
                                                minWidth: { xs: '100px', sm: '120px' },
                                                fontSize: { xs: '0.875rem', sm: '1rem' }
                                            }}
                                        >
                                            Roll No
                                        </StyledTableCell>
                                        <StyledTableCell 
                                            align="center"
                                            sx={{ 
                                                minWidth: { xs: '140px', sm: '180px' },
                                                fontSize: { xs: '0.875rem', sm: '1rem' }
                                            }}
                                        >
                                            Status
                                        </StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredStudents.map((student) => (
                                        <StyledTableRow key={student._id}>
                                            <StyledTableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                                {student.name}
                                            </StyledTableCell>
                                            <StyledTableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                                {student.rollNum}
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Box sx={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: { xs: 0.5, sm: 1 }
                                                }}>
                                                    <Switch
                                                        checked={!!attendance[student._id]}
                                                        onChange={(e) => handleAttendanceChange(student._id, e.target.checked)}
                                                        color="success"
                                                        disabled={loader}
                                                        size="small"
                                                    />
                                                    <Typography 
                                                        component="span" 
                                                        sx={{ 
                                                            color: attendance[student._id] ? 'success.main' : 'error.main',
                                                            fontSize: { xs: '0.875rem', sm: '1rem' },
                                                            fontWeight: 'medium'
                                                        }}
                                                    >
                                                        {attendance[student._id] ? 'Present' : 'Absent'}
                                                    </Typography>
                                                </Box>
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Show count of students marked present */}
                        <Box sx={{ 
                            mb: 2, 
                            p: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 1
                        }}>
                            <Typography 
                                variant="subtitle1" 
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                    textAlign: 'center',
                                    fontSize: { xs: '0.9rem', sm: '1rem' }
                                }}
                            >
                                <span>Present:</span> 
                                <span style={{ 
                                    color: '#4caf50', 
                                    fontWeight: 'bold',
                                    fontSize: '1.1em'
                                }}>
                                    {Object.values(attendance).filter(Boolean).length}
                                </span>
                                <span>of</span>
                                <span style={{ fontWeight: 'bold' }}>
                                    {filteredStudents.length}
                                </span>
                                <span>students</span>
                            </Typography>
                        </Box>

                        <PurpleButton
                            fullWidth
                            size="large"
                            type="submit"
                            disabled={loader}
                            sx={{
                                mt: 2,
                                py: { xs: 2, sm: 1.5 },
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                fontWeight: 'medium',
                                borderRadius: 2,
                                boxShadow: 2,
                                '&:disabled': {
                                    bgcolor: 'action.disabledBackground',
                                    color: 'text.disabled'
                                }
                            }}
                        >
                            {loader ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CircularProgress size={20} color="inherit" />
                                    <span>Submitting...</span>
                                </Box>
                            ) : (
                                "Submit Attendance"
                            )}
                        </PurpleButton>
                    </form>

                    <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} success={success} />
                </Box>
            )}
        </>
    );
};

export default BulkAttendance;