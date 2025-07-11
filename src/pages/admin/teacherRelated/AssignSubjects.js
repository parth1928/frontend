import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { Box, Button, Checkbox, FormControlLabel, Typography, CircularProgress } from '@mui/material';
import { updateTeacherSubject } from '../../../redux/userRelated/userHandle';
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

    const { subjectsList } = useSelector((state) => state.sclass);
    const { currentUser, status, response } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getSubjectList(currentUser._id, "AllSubjects"));
    }, [dispatch, currentUser._id]);

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
        dispatch(updateTeacherSubject({ 
            teacherId: teacherId,
            teachSubjects: selectedSubjects
        }));
    };

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
            <Typography variant="h5" gutterBottom>
                Assign Subjects to Teacher
            </Typography>
            <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Select subjects for this teacher:
                    </Typography>
                    {subjectsList && subjectsList.map((subject) => (
                        <FormControlLabel
                            key={subject._id}
                            control={
                                <Checkbox
                                    checked={selectedSubjects.includes(subject._id)}
                                    onChange={() => handleSubjectToggle(subject._id)}
                                />
                            }
                            label={`${subject.subName} (${subject.subCode})`}
                        />
                    ))}
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loader || selectedSubjects.length === 0}
                >
                    {loader ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                </Button>
            </form>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default AssignSubjects;
