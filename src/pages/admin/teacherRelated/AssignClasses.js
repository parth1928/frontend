import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import { Box, Button, Checkbox, FormControlLabel, Typography, CircularProgress, Paper, Alert } from '@mui/material';
import Popup from '../../../components/Popup';
import axios from 'axios';

const AssignClasses = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const teacherId = params.id;

    const [selectedClasses, setSelectedClasses] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const { sclassesList, loading: classesLoading } = useSelector((state) => state.sclass);
    const { currentUser, responseUser } = useSelector((state) => state.user);
    
    // Get the base URL from environment or use the default
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://backend-a2q3.onrender.com';

    // Fetch the teacher details
    useEffect(() => {
        if (teacherId) {
            dispatch(getUserDetails(teacherId, 'Teacher'));
        }
    }, [dispatch, teacherId]);

    // Fetch all classes
    useEffect(() => {
        if (currentUser && currentUser._id) {
            dispatch(getAllSclasses(currentUser._id));
        }
    }, [dispatch, currentUser]);

    // Initialize selected classes from teacher data when it loads
    useEffect(() => {
        if (responseUser) {
            const classIds = [];
            
            // Add primary class if it exists
            if (responseUser.teachSclass && responseUser.teachSclass._id) {
                classIds.push(responseUser.teachSclass._id);
            }
            
            // Add any additional classes if they exist
            if (responseUser.teachClasses && Array.isArray(responseUser.teachClasses)) {
                responseUser.teachClasses.forEach(classId => {
                    if (!classIds.includes(classId)) {
                        classIds.push(classId);
                    }
                });
            }
            
            setSelectedClasses(classIds);
            setInitialLoad(false);
        }
    }, [responseUser, initialLoad]);

    const handleClassToggle = (classId) => {
        setSelectedClasses(prev => {
            if (prev.includes(classId)) {
                return prev.filter(id => id !== classId);
            } else {
                return [...prev, classId];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoader(true);
        
        try {
            // Call the API to update teacher classes
            const response = await axios.put(`${apiBaseUrl}/TeacherClasses`, {
                teacherId: teacherId,
                teachClasses: selectedClasses
            });
            
            if (response.data) {
                setMessage("Classes assigned successfully");
                setShowPopup(true);
                
                setTimeout(() => {
                    navigate('/Admin/teachers');
                }, 1500);
            }
        } catch (error) {
            console.error('Error assigning classes:', error);
            setMessage(error.response?.data?.message || "Failed to assign classes");
            setShowPopup(true);
        } finally {
            setLoader(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Assign Classes to Teacher
                </Typography>

                {classesLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Select classes for this teacher:
                            </Typography>
                            
                            {!sclassesList || sclassesList.length === 0 ? (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    No classes available. Please create classes first.
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
                                    {Array.isArray(sclassesList) && sclassesList.map((classObj) => (
                                        <FormControlLabel
                                            key={classObj._id}
                                            control={
                                                <Checkbox
                                                    checked={selectedClasses.includes(classObj._id)}
                                                    onChange={() => handleClassToggle(classObj._id)}
                                                />
                                            }
                                            label={classObj.sclassName}
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
                                disabled={loader || selectedClasses.length === 0}
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

export default AssignClasses;