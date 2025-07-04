import { useEffect, useState } from "react";
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { Paper, Box, Typography, ButtonGroup, Button, Popper, Grow, ClickAwayListener, MenuList, MenuItem } from '@mui/material';
import { BlackButton, BlueButton} from "../../components/buttonStyles";
import TableTemplate from "../../components/TableTemplate";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import QuickAttendance from './QuickAttendance';

// Define your backend URL here or import from config
const BACKEND_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const TeacherClassDetails = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { sclassStudents, loading, error, getresponse } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);
    const classID = currentUser.teachSclass?._id
    const subjectID = currentUser.teachSubject?._id

    // State for subject details (to get isLab and batches)
    const [subjectDetail, setSubjectDetail] = useState(null);
    const [selectedBatchIdx, setSelectedBatchIdx] = useState(0);
    const [showQuickAttendance, setShowQuickAttendance] = useState(false);
    // For download button loading state
    const [isDownloading, setIsDownloading] = useState(false);

    // Handler for dropdown toggle (used in BlackButton)
    const [open, setOpen] = useState(false);
    const anchorRef = React.useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const options = ['Take Attendance', 'Provide Marks'];

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    // Modified to accept batchIdx for lab subjects
    const downloadExcel = async (batchIdx) => {
        if (!classID || !subjectID) {
            alert('Class and Subject information is required');
            return;
        }

        setIsDownloading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `${BACKEND_URL}/attendance/download/${classID}/${subjectID}`;
            if (subjectDetail && subjectDetail.isLab && Array.isArray(subjectDetail.batches) && subjectDetail.batches.length > 0) {
                url += `?batchIdx=${batchIdx}`;
            }
            const response = await fetch(
                url,
                {
                    headers: {
                        'Authorization': token || ''
                    }
                }
            );
            // Check if response is ok before trying to parse it
            if (!response.ok) {
                throw new Error('Failed to download attendance');
            }
            // Get the response as blob directly
            const blob = await response.blob();
            if (blob.type.includes('application/json')) {
                // If we got JSON instead of an Excel file, there's an error
                const reader = new FileReader();
                reader.onload = () => {
                    const errorData = JSON.parse(reader.result);
                    alert(errorData.message || 'Failed to generate Excel file');
                };
                reader.readAsText(blob);
                return;
            }

            const urlObj = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = urlObj;
            link.download = `attendance_${classID}_${new Date().toISOString().slice(0,10)}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(urlObj);
        } catch (error) {
            console.error('Download failed:', error);
            alert(error.message || 'Failed to download attendance');
        } finally {
            setIsDownloading(false);
        }
    };




    // Fetch students for the class when classID changes
    useEffect(() => {
        if (classID) {
            dispatch(getClassStudents(classID));
        }
    }, [classID, dispatch]);

    // Fetch subject details for batch info
    useEffect(() => {
        const fetchSubjectDetail = async () => {
            if (!subjectID) return;
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${BACKEND_URL}/subject/${subjectID}`, {
                    headers: { 'Authorization': token || '' }
                });
                if (!response.ok) throw new Error('Failed to fetch subject details');
                const data = await response.json();
                setSubjectDetail(data);
            } catch (err) {
                setSubjectDetail(null);
            }
        };
        fetchSubjectDetail();
    }, [subjectID]);

    if (error) {
        console.log(error)
    }

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
    ]

    // Filter students for selected batch if lab subject
    let filteredStudents = sclassStudents;
    if (subjectDetail && subjectDetail.isLab && Array.isArray(subjectDetail.batches) && subjectDetail.batches.length > 0) {
        const batch = subjectDetail.batches[selectedBatchIdx] || { students: [] };
        filteredStudents = sclassStudents.filter(stu => batch.students.includes(stu._id));
    }

    const studentRows = filteredStudents.map((student) => ({
        name: student.name,
        rollNum: student.rollNum,
        id: student._id,
    }));

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <Typography variant="h4" align="center" gutterBottom>
                        Class Details
                    </Typography>
                    {getresponse ? (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                No Students Found
                            </Box>
                        </>
                    ) : (
                        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                            <Typography variant="h5" gutterBottom>
                                Students List:
                            </Typography>

                            {/* Batch selection for lab subjects only */}
                            {subjectDetail && subjectDetail.isLab && Array.isArray(subjectDetail.batches) && subjectDetail.batches.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ color: '#1976d2', fontWeight: 600 }}>Select Batch:</Typography>
                                    <select
                                        value={selectedBatchIdx}
                                        onChange={e => setSelectedBatchIdx(Number(e.target.value))}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #1976d2', marginLeft: '12px' }}
                                    >
                                        {subjectDetail.batches.map((batch, idx) => (
                                            <option value={idx} key={idx}>{batch.batchName || `Batch ${idx + 1}`}</option>
                                        ))}
                                    </select>
                                </Box>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h5">
                                    Students List:
                                </Typography>
                                <BlueButton
                                    onClick={() => downloadExcel(selectedBatchIdx)}
                                    disabled={isDownloading}
                                >
                                    {isDownloading ? 'Downloading...' : 'Download Attendance Excel'}
                                </BlueButton>
                                <BlueButton
                                    onClick={() => setShowQuickAttendance(!showQuickAttendance)}
                                >
                                    {showQuickAttendance ? 'Hide Quick Attendance' : 'Quick Attendance'}
                                </BlueButton>
                            </Box>
                            {showQuickAttendance && (
                                <Box sx={{ mb: 2 }}>
                                    <QuickAttendance classID={classID} subjectID={subjectID} />
                                </Box>
                            )}
                            {Array.isArray(filteredStudents) && filteredStudents.length > 0 &&
                                <TableTemplate columns={studentColumns} rows={studentRows} />
                            }
                        </Paper>
                    )}
                </>
            )}
        </>
    );
}
export default TeacherClassDetails;