import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    Typography,
    CircularProgress,
    Paper,
    Alert,
    Chip,
    Divider
} from '@mui/material';
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import { getTeachers } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import axios from '../../../api/axiosInstance';

const AssignTeachers = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const subjectId = params.id;

    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const { currentUser } = useSelector((state) => state.user);
    const [subjectDetails, setSubjectDetails] = useState(null);
    const [teachersList, setTeachersList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch subject details
    useEffect(() => {
        const fetchSubjectDetails = async () => {
            if (!subjectId) return;

            try {
                const response = await axios.get(`/subject/${subjectId}`);
                setSubjectDetails(response.data);
                // Initialize selected teachers from subject data
                if (response.data.teachers && initialLoad) {
                    const teacherIds = response.data.teachers.map(teacher => teacher._id);
                    setSelectedTeachers(teacherIds);
                    setInitialLoad(false);
                }
            } catch (error) {
                console.error('Error fetching subject details:', error);
                setMessage('Failed to load subject details');
                setShowPopup(true);
            }
        };

        fetchSubjectDetails();
    }, [subjectId, initialLoad]);

    // Fetch all teachers
    useEffect(() => {
        const fetchTeachers = async () => {
            if (!currentUser?._id) return;

            try {
                const response = await axios.get(`/Teachers/${currentUser._id}`);
                if (response.data && Array.isArray(response.data)) {
                    setTeachersList(response.data);
                }
            } catch (error) {
                console.error('Error fetching teachers:', error);
                setMessage('Failed to load teachers list');
                setShowPopup(true);
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
    }, [currentUser]);

    const handleTeacherToggle = (teacherId) => {
        setSelectedTeachers(prev => {
            if (prev.includes(teacherId)) {
                return prev.filter(id => id !== teacherId);
            } else {
                return [...prev, teacherId];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoader(true);

        try {
            // Update subject with selected teachers
            await axios.put(`/subject/${subjectId}/teachers`, {
                teachers: selectedTeachers
            });

            // Update each teacher's subject list
            for (const teacherId of selectedTeachers) {
                const teacher = teachersList.find(t => t._id === teacherId);
                if (teacher) {
                    const currentSubjects = teacher.teachSubjects || [];
                    if (!currentSubjects.includes(subjectId)) {
                        await axios.put('/TeacherSubject', {
                            teacherId: teacherId,
                            teachSubjects: [...currentSubjects, subjectId]
                        });
                    }
                }
            }

            // Remove subject from teachers who are no longer assigned
            const previouslyAssignedTeachers = subjectDetails?.teachers?.map(t => t._id) || [];
            const removedTeachers = previouslyAssignedTeachers.filter(id => !selectedTeachers.includes(id));

            for (const teacherId of removedTeachers) {
                const teacher = teachersList.find(t => t._id === teacherId);
                if (teacher) {
                    const updatedSubjects = teacher.teachSubjects.filter(id => id !== subjectId);
                    await axios.put('/TeacherSubject', {
                        teacherId: teacherId,
                        teachSubjects: updatedSubjects
                    });
                }
            }

            setMessage("Teachers assigned successfully!");
            setShowPopup(true);
            setTimeout(() => {
                navigate('/Admin/subjects');
            }, 1500);

        } catch (error) {
            console.error('Error assigning teachers:', error);
            setMessage(error.message || "Failed to assign teachers");
            setShowPopup(true);
        } finally {
            setLoader(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, margin: 'auto', padding: 3 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Assign Teachers to Subject
                </Typography>

                {subjectDetails && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Subject: {subjectDetails.subName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Code: {subjectDetails.subCode} | Sessions: {subjectDetails.sessions}
                        </Typography>
                        {subjectDetails.sclassName && (
                            <Typography variant="body2" color="text.secondary">
                                Class: {subjectDetails.sclassName.sclassName}
                            </Typography>
                        )}
                        {subjectDetails.isLab && (
                            <Chip label="Lab Subject" color="success" size="small" sx={{ mt: 1 }} />
                        )}
                    </Box>
                )}

                <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Select teachers for this subject:
                        </Typography>

                        {!teachersList || teachersList.length === 0 ? (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                No teachers available. Please create teachers first.
                            </Alert>
                        ) : (
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                gap: 2,
                                mt: 2,
                                maxHeight: '400px',
                                overflowY: 'auto',
                                p: 2,
                                border: '1px solid #e0e0e0',
                                borderRadius: 1
                            }}>
                                {teachersList.map((teacher) => (
                                    <Paper
                                        key={teacher._id}
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            border: selectedTeachers.includes(teacher._id) ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                            bgcolor: selectedTeachers.includes(teacher._id) ? 'rgba(25, 118, 210, 0.08)' : 'background.paper'
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedTeachers.includes(teacher._id)}
                                                    onChange={() => handleTeacherToggle(teacher._id)}
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                        {teacher.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {teacher.teachSclass?.sclassName || 'No class assigned'}
                                                    </Typography>
                                                    {teacher.teachSubjects && teacher.teachSubjects.length > 0 && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Current subjects: {teacher.teachSubjects.length}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                            sx={{ width: '100%', alignItems: 'flex-start' }}
                                        />
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {selectedTeachers.length} teacher{selectedTeachers.length !== 1 ? 's' : ''} selected
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/Admin/subjects')}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={loader}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Paper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default AssignTeachers;