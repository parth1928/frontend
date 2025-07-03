import React, { useEffect, useState } from "react";
import { Button, TextField, Grid, Box, Typography, CircularProgress, FormControlLabel, Switch, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';

const SubjectForm = () => {
    const [subjects, setSubjects] = useState([{ subName: "", subCode: "", sessions: "", isLab: false, batches: [] }]);
    const [batchCounts, setBatchCounts] = useState([0]);
    const [batchRanges, setBatchRanges] = useState([[]]);

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error } = userState;

    const { studentsList } = useSelector(state => state.student);

    const sclassName = params.id
    const adminID = currentUser._id
    const address = "Subject"

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    const handleSubjectNameChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].subName = event.target.value;
        setSubjects(newSubjects);
    };

    const handleSubjectCodeChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].subCode = event.target.value;
        setSubjects(newSubjects);
    };

    const handleSessionsChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].sessions = event.target.value || 0;
        setSubjects(newSubjects);
    };


    const handleIsLabChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].isLab = event.target.checked;
        setSubjects(newSubjects);
    };

    const handleAddSubject = () => {
        setSubjects([...subjects, { subName: "", subCode: "", sessions: "", isLab: false }]);
    };

    const handleRemoveSubject = (index) => () => {
        const newSubjects = [...subjects];
        newSubjects.splice(index, 1);
        setSubjects(newSubjects);
    };

    const fields = {
        sclassName,
        subjects: subjects.map((subject) => ({
            subName: subject.subName,
            subCode: subject.subCode,
            sessions: subject.sessions,
            isLab: subject.isLab || false,
        })),
        adminID,
    };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true)
        dispatch(addStuff(fields, address))
    };

    useEffect(() => {
        if (status === 'added') {
            // If the first subject is a lab, redirect to batch assignment
            const firstLab = subjects.find(s => s.isLab);
            if (firstLab) {
                // Assume backend returns new subject ID in response._id or response.subjectID
                // Fallback to /Admin/subjects if not found
                const subjectID = response && (response._id || response.subjectID);
                if (subjectID) {
                    navigate(`/Admin/subjects/batch-assign/${sclassName}/${subjectID}`);
                } else {
                    navigate("/Admin/subjects");
                }
            } else {
                navigate("/Admin/subjects");
            }
            dispatch(underControl())
            setLoader(false)
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            setMessage("Network Error")
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, navigate, error, response, dispatch, subjects, sclassName]);

    return (
        <form onSubmit={submitHandler}>
            <Box mb={2}>
                <Typography variant="h6">Add Subjects</Typography>
            </Box>
            <Grid container spacing={2}>
                {subjects.map((subject, index) => (
                    <React.Fragment key={index}>
                        <Grid item xs={12}>
                            <Box p={2} mb={2} sx={{ border: '2px solid #1976d2', borderRadius: 2, background: '#f0f6ff' }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Subject Name"
                                            variant="outlined"
                                            value={subject.subName}
                                            onChange={handleSubjectNameChange(index)}
                                            sx={styles.inputField}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Subject Code"
                                            variant="outlined"
                                            value={subject.subCode}
                                            onChange={handleSubjectCodeChange(index)}
                                            sx={styles.inputField}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <TextField
                                            fullWidth
                                            label="Sessions"
                                            variant="outlined"
                                            type="number"
                                            inputProps={{ min: 0 }}
                                            value={subject.sessions}
                                            onChange={handleSessionsChange(index)}
                                            sx={styles.inputField}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <Box display="flex" alignItems="center" justifyContent="center">
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={subject.isLab || false}
                                                        onChange={handleIsLabChange(index)}
                                                        color="primary"
                                                    />
                                                }
                                                label={<span style={{ fontWeight: 600, color: '#1976d2' }}>Is this a lab subject?</span>}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" alignItems="flex-end" justifyContent="flex-end">
                                {index === 0 ? (
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={handleAddSubject}
                                    >
                                        Add Subject
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={handleRemoveSubject(index)}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </React.Fragment>
                ))}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                        <Button variant="contained" color="primary" type="submit" disabled={loader}>
                            {loader ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Save'
                            )}
                        </Button>
                    </Box>
                </Grid>
                <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            </Grid>
        </form>
    );
}

export default SubjectForm

const styles = {
    inputField: {
        '& .MuiInputLabel-root': {
            color: '#838080',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#838080',
        },
    },
};