import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { getUserDetails, updateTeacherSubject } from '../../../redux/userRelated/userHandle';
import { Box, Button, Checkbox, FormControlLabel, Typography, CircularProgress, Paper, Alert } from '@mui/material';
import Popup from '../../../components/Popup';

const AssignSubjects = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const teacherId = params.id;

    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const { subjectsList, loading: subjectsLoading } = useSelector((state) => state.sclass);
    const { currentUser, status, response, responseUser } = useSelector((state) => state.user);

    // Fetch the teacher details
    useEffect(() => {
        if (teacherId) {
            dispatch(getUserDetails(teacherId, 'Teacher'));
        }
    }, [dispatch, teacherId]);

    // Fetch all subjects
    useEffect(() => {
        dispatch(getSubjectList(currentUser._id, "AllSubjects"));
    }, [dispatch, currentUser._id]);

    // Initialize selected subjects from teacher data when it loads
    useEffect(() => {
        if (responseUser && responseUser.teachSubjects && initialLoad) {
            const subjectIds = responseUser.teachSubjects.map(subject => subject._id);
            setSelectedSubjects(subjectIds);
            setInitialLoad(false);
        }
    }, [responseUser, initialLoad]);

    const handleSubjectToggle = (subjectId) => {
        setSelectedSubjects(prev => {
            if (prev.includes(subjectId)) {
                return prev.filter(id => id !== subjectId);
            } else {
                return [...prev, subjectId];
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoader(true);
        console.log('Submitting subjects:', selectedSubjects);
        dispatch(updateTeacherSubject({ 
            teacherId: teacherId,
            teachSubjects: selectedSubjects
        }))
        .then((result) => {
            console.log('Submit result:', result);
            // Add a small delay to ensure the UI updates
            setTimeout(() => {
                setLoader(false);
                setMessage("Subjects assigned successfully");
                setShowPopup(true);
                // Navigate back after a short delay
                setTimeout(() => {
                    navigate('/Admin/teachers');
                }, 1500);
            }, 500);
        })
        .catch((error) => {
            console.error('Submit error:', error);
            setLoader(false);
            setMessage(error.message || "Failed to assign subjects");
            setShowPopup(true);
        });
    };

    // Still keep the status effect for backward compatibility
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
        <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3 }}>
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
                            
                            {!subjectsList || subjectsList.length === 0 ? (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    No subjects available. Please create subjects first.
                                </Alert>
                            ) : (
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: 1,
                                    mt: 2,
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    p: 1,
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 1
                                }}>
                                    {Array.isArray(subjectsList) && subjectsList.map((subject) => (
                                        <FormControlLabel
                                            key={subject._id}
                                            control={
                                                <Checkbox
                                                    checked={selectedSubjects.includes(subject._id)}
                                                    onChange={() => handleSubjectToggle(subject._id)}
                                                />
                                            }
                                            label={`${subject.subName} (${subject.sclassName.sclassName})`}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/Admin/teachers')}
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
