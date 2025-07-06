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
    // Always get params at the very top, only once
    const params = useParams();
    let classID = params.classID;
    let subjectID = params.subjectID;
    // Defensive: check for undefined/null/empty classID
    if (!classID || classID === 'undefined' || classID === 'null' || classID.trim() === '') {
        console.error('BulkAttendance: classID is invalid:', classID);
        classID = undefined;
    }
    if (!subjectID || subjectID === 'undefined' || subjectID === 'null' || subjectID.trim() === '') {
        console.error('BulkAttendance: subjectID is invalid:', subjectID);
        subjectID = undefined;
    }
    // Debug log for params
    console.log('BulkAttendance: classID:', classID, 'subjectID:', subjectID);
    // Hard fail: if classID is invalid, show error and do not render UI
    if (!classID) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" color="error" gutterBottom>
                    Error: Invalid or missing class ID. Cannot load attendance page.
                </Typography>
                <Typography variant="body1">
                    Please return to the previous page and try again. If the problem persists, contact your administrator.
                </Typography>
            </Box>
        );
    }
    const dispatch = useDispatch();
    const { sclassStudents, loading } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);
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
    const [attendanceInitialized, setAttendanceInitialized] = useState(false);
    const [subjectDetails, setSubjectDetails] = useState({});
    const [batchList, setBatchList] = useState([]);
    const [batchName, setBatchName] = useState(initialBatchName);

    // Reset batchName when subject changes (for lab subjects), but only if not set from URL
    useEffect(() => {
        if (subjectDetails.isLab && !initialBatchName) {
            setBatchName('');
        }
    }, [subjectID]);

    // Reset attendance and initialization flag when batch changes for lab subjects
    useEffect(() => {
        if (subjectDetails.isLab) {
            setAttendance({});
            setAttendanceInitialized(false);
        }
    }, [batchName]);

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
        // Try to get adminId from currentUser.admin, currentUser.school, or fallback to currentUser._id
        let adminId = undefined;
        if (currentUser) {
            adminId = currentUser.admin || currentUser.school || currentUser._id;
        }
        // Fallback: try to get adminId from user in localStorage if still undefined
        if (!adminId) {
            try {
                const userLS = JSON.parse(localStorage.getItem('user'));
                adminId = userLS?.admin || userLS?.school || userLS?._id;
            } catch (e) {}
        }
        // Final fallback: use a hardcoded string to avoid undefined
        if (!adminId) {
            adminId = 'default';
            console.warn('BulkAttendance: adminId is missing, using fallback value.');
        }
        adminId = String(adminId);
        console.log('BulkAttendance currentUser:', currentUser);
        console.log('BulkAttendance using adminId:', adminId);
        // Extra defensive: Only dispatch if classID and adminId are valid
        if (!classID || typeof classID !== 'string' || classID.trim() === '' || classID === 'undefined' || classID === 'null') {
            console.warn('BulkAttendance: Invalid classID, not fetching students. classID:', classID);
            return;
        }
        if (!adminId || adminId === 'undefined') {
            console.warn('BulkAttendance: Invalid adminId, skipping fetch. adminId:', adminId);
            return;
        }
        dispatch(getClassStudents(classID, adminId));
    }, [dispatch, classID, currentUser]);

    // Filter students for selected batch if lab
    const filteredStudents = subjectDetails.isLab && batchName
        ? sclassStudents.filter(student => {
            const sid = String(student._id);
            if (!sid || sid === 'undefined' || sid === 'null' || sid.trim() === '') {
                console.error('Filtered student with invalid _id:', student);
                return false;
            }
            const batch = batchList.find(b => b.batchName === batchName);
            return batch && batch.students.map(id => String(id)).includes(sid);
        })
        : (!subjectDetails.isLab ? sclassStudents.filter(student => {
            const sid = String(student._id);
            if (!sid || sid === 'undefined' || sid === 'null' || sid.trim() === '') {
                console.error('Filtered student with invalid _id:', student);
                return false;
            }
            return true;
        }) : []); // For lab, if no batch selected, show none

    // Debug log for filtered students
    useEffect(() => {
        console.log('BulkAttendance filteredStudents:', filteredStudents);
    }, [filteredStudents]);

    // Preserve attendance toggle state when students change
    useEffect(() => {
        if (!attendanceInitialized && filteredStudents.length > 0) {
            const initialAttendance = {};
            for (const student of filteredStudents) {
                const sid = String(student._id);
                if (!(sid in attendance)) {
                    initialAttendance[sid] = true; // default to present
                } else {
                    initialAttendance[sid] = attendance[sid]; // preserve toggle if exists
                }
            }
            setAttendance(initialAttendance);
            setAttendanceInitialized(true);
            console.log('✅ Attendance initialized or preserved:', initialAttendance);
        }
        // No else branch: do not reset attendance if students disappear, to preserve toggles
    }, [filteredStudents]);

    const handleAttendanceChange = (studentId, checked) => {
        setAttendance(prev => {
            const newState = {
                ...prev,
                [String(studentId)]: checked
            };
            console.log('BulkAttendance attendance updated:', newState);
            return newState;
        });
    };

    const markAllPresent = () => {
        if (subjectDetails.isLab && !batchName) return;
        const newAttendance = {};
        filteredStudents.forEach(student => {
            newAttendance[String(student._id)] = true;
        });
        setAttendance(newAttendance);
    };

    const markAllAbsent = () => {
        if (subjectDetails.isLab && !batchName) return;
        const newAttendance = {};
        filteredStudents.forEach(student => {
            newAttendance[String(student._id)] = false;
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
                const sid = String(student._id);
                const fields = {
                    subName: currentUser.teachSubject._id,
                    status: attendance[sid] ? 'Present' : 'Absent',
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
                                    disabled={subjectDetails.isLab && !batchName}
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
                                    disabled={subjectDetails.isLab && !batchName}
                                >
                                    Mark All Absent
                                </Button>
                            </Box>
                        </Stack>

                        {/* Only render table if not lab or (lab and batchName selected) */}
                        {!subjectDetails.isLab || (subjectDetails.isLab && batchName) ? (
                            <>
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
                                            {filteredStudents.map((student, idx) => {
                                                const sid = String(student._id);
                                                if (!sid || sid === 'undefined' || sid === 'null' || sid.trim() === '') {
                                                    console.error('Rendering Switch for invalid student._id:', student, idx);
                                                    return null;
                                                }
                                                const isDisabled = loader || (subjectDetails.isLab && !batchName);
                                                console.log('Rendering Switch for:', sid, attendance, 'Switch disabled:', isDisabled);
                                                return (
                                                    <StyledTableRow key={sid}>
                                                        <StyledTableCell>{student.name}</StyledTableCell>
                                                        <StyledTableCell>{student.rollNum}</StyledTableCell>
                                                        <StyledTableCell align="center">
                                                            <Switch
                                                                checked={!!attendance[sid]}
                                                                onChange={(e) => handleAttendanceChange(sid, e.target.checked)}
                                                                color="success"
                                                                disabled={isDisabled}
                                                            />
                                                            <Typography component="span" sx={{ ml: 1, color: attendance[sid] ? 'success.main' : 'error.main' }}>
                                                                {attendance[sid] ? 'Present' : 'Absent'}
                                                            </Typography>
                                                        </StyledTableCell>
                                                    </StyledTableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {/* Show count of students marked present */}
                                <Box sx={{ mb: 2, textAlign: 'center' }}>
                                    <Typography variant="subtitle1" color="success.main">
                                        Marked Present: {Object.values(attendance).filter(Boolean).length} / {filteredStudents.length}
                                    </Typography>
                                </Box>
                            </>
                        ) : (
                            <Typography variant="subtitle1" color="error.main" sx={{ mt: 3 }}>
                                Please select a batch to take attendance.
                            </Typography>
                        )}

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