import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { getUserDetails, updateTeacherSubject } from '../../../redux/userRelated/userHandle';
import { Box, Button, Checkbox, FormControlLabel, Typography, CircularProgress, Paper, Alert, Chip, Divider, List, ListItem, ListItemText, Collapse, IconButton } from '@mui/material';
import Popup from '../../../components/Popup';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const AssignSubjects = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const teacherId = params.id;

    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [existingAssignments, setExistingAssignments] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);
    const [expandedSubjects, setExpandedSubjects] = useState(new Set());

    const { subjectsList, loading: subjectsLoading } = useSelector((state) => state.sclass);
    const { currentUser, status, response, responseUser } = useSelector((state) => state.user);

    // Get the base URL from environment or use the default
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://backend-a2q3.onrender.com';

    // Fetch the teacher details
    useEffect(() => {
        if (teacherId) {
            dispatch(getUserDetails(teacherId, 'Teacher'));
        }
    }, [dispatch, teacherId]);

    // Fetch all subjects
    useEffect(() => {
        if (currentUser && currentUser._id) {
            dispatch(getSubjectList(currentUser._id, "AllSubjects"));
        }
    }, [dispatch, currentUser]);

    // Fetch existing assignments for all teachers
    useEffect(() => {
        const fetchExistingAssignments = async () => {
            if (currentUser && currentUser._id) {
                try {
                    const response = await axios.get(`${apiBaseUrl}/TeacherSubjectAssignments/all`);
                    setExistingAssignments(response.data.assignments || []);
                } catch (error) {
                    console.error('Error fetching existing assignments:', error);
                }
            }
        };

        fetchExistingAssignments();
    }, [currentUser, apiBaseUrl]);

    // Initialize selected subjects from current teacher
    useEffect(() => {
        if (responseUser && responseUser.teachSubjects) {
            const currentSubjectIds = responseUser.teachSubjects.map(subject => subject._id);
            setSelectedSubjects(currentSubjectIds);
        }
    }, [responseUser]);

    const handleSubjectToggle = (subjectId) => {
        setSelectedSubjects(prev => {
            if (prev.includes(subjectId)) {
                return prev.filter(id => id !== subjectId);
            } else {
                return [...prev, subjectId];
            }
        });
    };

    const toggleSubjectExpansion = (subjectId) => {
        setExpandedSubjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(subjectId)) {
                newSet.delete(subjectId);
            } else {
                newSet.add(subjectId);
            }
            return newSet;
        });
    };

    const getAssignmentsForSubject = (subjectId) => {
        return existingAssignments.filter(assignment =>
            assignment.subject._id === subjectId &&
            assignment.teacher._id !== teacherId // Exclude current teacher
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoader(true);

        try {
            // Get subject details for selected subjects
            const assignments = selectedSubjects.map(subjectId => {
                const subject = subjectsList.find(s => s._id === subjectId);
                return {
                    subjectId: subjectId,
                    classId: subject.sclassName._id,
                    batch: null // For now, handle lab subjects later
                };
            });

            const result = await dispatch(updateTeacherSubject({
                teacherId: teacherId,
                subjectAssignments: assignments
            }));

            setMessage("Subjects assigned successfully");
            setShowPopup(true);

            // Refresh teacher details to update the user object
            dispatch(getUserDetails(teacherId, 'Teacher'));

            // Navigate back after showing success message
            setTimeout(() => {
                navigate('/Admin/teachers');
            }, 2000);

        } catch (error) {
            console.error('Submit error:', error);
            setMessage(error.message || "Failed to assign subjects");
            setShowPopup(true);
        } finally {
            setLoader(false);
        }
    };

    // Status effect for backward compatibility
    useEffect(() => {
        if (status === 'success') {
            navigate('/Admin/teachers');
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, response]);

    return (
        <Box sx={{ maxWidth: 800, margin: 'auto', padding: 3 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Assign Subjects to Teacher
                </Typography>

                {subjectsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Select subjects for this teacher:
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                You can assign the same subject to multiple teachers. Subjects already assigned to other teachers are shown below.
                            </Typography>

                            {!subjectsList || subjectsList.length === 0 ? (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    No subjects available. Please create subjects first.
                                </Alert>
                            ) : (
                                <List sx={{
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 1
                                }}>
                                    {subjectsList.map((subject) => {
                                        const otherAssignments = getAssignmentsForSubject(subject._id);
                                        const isSelected = selectedSubjects.includes(subject._id);
                                        const hasOtherAssignments = otherAssignments.length > 0;
                                        const isExpanded = expandedSubjects.has(subject._id);

                                        return (
                                            <React.Fragment key={subject._id}>
                                                <ListItem
                                                    sx={{
                                                        borderBottom: '1px solid #f0f0f0',
                                                        '&:last-child': { borderBottom: 'none' }
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onChange={() => handleSubjectToggle(subject._id)}
                                                            />
                                                        }
                                                        label={
                                                            <Box>
                                                                <Typography variant="body1">
                                                                    {subject.subName} ({subject.subCode})
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Class: {subject.sclassName.sclassName}
                                                                    {subject.isLab && ' (Lab Subject)'}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                        sx={{ flex: 1 }}
                                                    />

                                                    {hasOtherAssignments && (
                                                        <IconButton
                                                            onClick={() => toggleSubjectExpansion(subject._id)}
                                                            size="small"
                                                        >
                                                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                        </IconButton>
                                                    )}
                                                </ListItem>

                                                {hasOtherAssignments && (
                                                    <Collapse in={isExpanded}>
                                                        <Box sx={{ pl: 4, pr: 2, pb: 1 }}>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                Already assigned to:
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                                {otherAssignments.map((assignment, index) => (
                                                                    <Chip
                                                                        key={index}
                                                                        label={`${assignment.teacher.name} (${assignment.sclass.sclassName})`}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        color="primary"
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    </Collapse>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </List>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/Admin/teachers')}
                                disabled={loader}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={loader || selectedSubjects.length === 0}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                            </Button>
                        </Box>
                    </form>
                )}
            </Paper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default AssignSubjects;
