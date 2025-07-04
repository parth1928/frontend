import React, { useEffect, useState } from "react";
import { Button, TextField, Grid, Box, Typography, CircularProgress, FormControlLabel, Switch } from "@mui/material";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';

const SubjectForm = () => {
    const [subjects, setSubjects] = useState([{ subName: "", subCode: "", sessions: "", isLab: false, batches: [] }]);

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
        // Reset batches if toggled off
        if (!event.target.checked) {
            newSubjects[index].batches = [];
        }
        setSubjects(newSubjects);
    };

    // Batch assignment logic
    const handleBatchCountChange = (index) => (event) => {
        const count = parseInt(event.target.value) || 0;
        const newSubjects = [...subjects];
        // Initialize batches as arrays of student IDs
        newSubjects[index].batches = Array.from({ length: count }, () => []);
        setSubjects(newSubjects);
    };

    const handleStudentToggle = (subjectIdx, batchIdx, studentId) => (event) => {
        const newSubjects = [...subjects];
        const batch = newSubjects[subjectIdx].batches[batchIdx] || [];
        if (event.target.checked) {
            // Add student
            if (!batch.includes(studentId)) batch.push(studentId);
        } else {
            // Remove student
            const i = batch.indexOf(studentId);
            if (i > -1) batch.splice(i, 1);
        }
        newSubjects[subjectIdx].batches[batchIdx] = batch;
        setSubjects(newSubjects);
    };

    const handleAddSubject = () => {
        setSubjects([...subjects, { subName: "", subCode: "", sessions: "", isLab: false, batches: [] }]);
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
            batches: subject.isLab && subject.batches && subject.batches.length > 0
                ? subject.batches.map((batch, idx) => ({
                    batchName: `Batch ${idx + 1}`,
                    students: batch
                }))
                : [],
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
            navigate("/Admin/subjects");
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
                                {/* Batch assignment UI for lab subjects */}
                                {subject.isLab && (
                                    <Box mt={3} p={2} sx={{ border: '1px dashed #1976d2', borderRadius: 2, background: '#e3f2fd' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2' }}>Batch Assignment</Typography>
                                        <Box mt={2} mb={2}>
                                            <TextField
                                                label="Number of Batches"
                                                type="number"
                                                inputProps={{ min: 1, max: 10 }}
                                                value={subject.batches ? subject.batches.length : 0}
                                                onChange={handleBatchCountChange(index)}
                                                sx={{ width: 200 }}
                                            />
                                        </Box>
                                        {subject.batches && subject.batches.length > 0 && (
                                            <Box>
                                                {subject.batches.map((batch, batchIdx) => (
                                                    <Box key={batchIdx} mb={2} p={2} sx={{ border: '1px solid #90caf9', borderRadius: 1, background: '#f5faff' }}>
                                                        <Typography variant="subtitle2" sx={{ color: '#1976d2', fontWeight: 500 }}>Batch {batchIdx + 1}</Typography>
                                                        <Grid container spacing={1}>
                                                            {studentsList && studentsList.length > 0 ? (
                                                                studentsList.map(student => (
                                                                    <Grid item xs={12} sm={6} md={4} key={student._id}>
                                                                        <FormControlLabel
                                                                            control={
                                                                                <Switch
                                                                                    checked={batch.includes(student._id)}
                                                                                    onChange={handleStudentToggle(index, batchIdx, student._id)}
                                                                                    color="primary"
                                                                                />
                                                                            }
                                                                            label={<span style={{ color: '#1976d2' }}>{student.name} ({student.rollNum})</span>}
                                                                        />
                                                                    </Grid>
                                                                ))
                                                            ) : (
                                                                <Typography>No students found.</Typography>
                                                            )}
                                                        </Grid>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                )}
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