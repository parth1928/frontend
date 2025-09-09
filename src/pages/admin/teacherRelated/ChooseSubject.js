import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Box, Table, TableBody, TableContainer, TableHead, Typography, Paper, Chip } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { updateTeachSubject } from '../../../redux/teacherRelated/teacherHandle';
import { GreenButton, PurpleButton } from '../../../components/buttonStyles';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';

const ChooseSubject = ({ situation }) => {
    const params = useParams();
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const [classID, setClassID] = useState("");
    const [teacherID, setTeacherID] = useState("");
    const [loader, setLoader] = useState(false)

    const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);

    useEffect(() => {
        if (situation === "Norm") {
            setClassID(params.id);
            const classID = params.id
            dispatch(getSubjectList(classID, "ClassSubjects"));
        }
        else if (situation === "Teacher") {
            const { classID, teacherID } = params
            setClassID(classID);
            setTeacherID(teacherID);
            dispatch(getSubjectList(classID, "ClassSubjects"));
        }
    }, [situation]);

    if (loading) {
        return <div>Loading...</div>;
    } else if (response) {
        return <div>
            <h1>No subjects found for this class</h1>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <PurpleButton variant="contained"
                    onClick={() => navigate("/Admin/addsubject/" + classID)}>
                    Add Subjects
                </PurpleButton>
            </Box>
        </div>;
    } else if (error) {
        console.log(error)
    }

    const updateSubjectHandler = async (teacherId, teachSubject) => {
        setLoader(true)
        
        try {
            // First get the current teacher's subjects
            const teacherResponse = await fetch(`/Teacher/${teacherId}`);
            const teacher = await teacherResponse.json();
            
            // Add the new subject to existing subjects (avoid duplicates)
            const currentSubjects = teacher.teachSubjects || [];
            const updatedSubjects = currentSubjects.includes(teachSubject) 
                ? currentSubjects 
                : [...currentSubjects, teachSubject];
            
            // Update teacher with new subjects list
            await fetch('/TeacherSubject', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teacherId, teachSubjects: updatedSubjects })
            });
            
            // Also update the subject's teacher list
            const subjectResponse = await fetch(`/subject/${teachSubject}`);
            const subject = await subjectResponse.json();
            
            const currentTeachers = subject.teachers ? subject.teachers.map(t => t._id || t) : [];
            const updatedTeachers = currentTeachers.includes(teacherId) 
                ? currentTeachers 
                : [...currentTeachers, teacherId];
            
            await fetch(`/subject/${teachSubject}/teachers`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teachers: updatedTeachers })
            });
            
            navigate("/Admin/teachers")
        } catch (error) {
            console.error('Error updating teacher subject:', error);
            setLoader(false);
        }
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Typography variant="h6" gutterBottom component="div">
                Choose subjects for the teacher (you can assign multiple teachers to the same subject)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select any subject to assign to this teacher. Subjects can have multiple teachers assigned.
            </Typography>
            <>
                <TableContainer>
                    <Table aria-label="sclasses table">
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell></StyledTableCell>
                                <StyledTableCell align="center">Subject Name</StyledTableCell>
                                <StyledTableCell align="center">Subject Code</StyledTableCell>
                                <StyledTableCell align="center">Teachers Assigned</StyledTableCell>
                                <StyledTableCell align="center">Actions</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(subjectsList) && subjectsList.length > 0 && subjectsList.map((subject, index) => (
                                <StyledTableRow key={subject._id}>
                                    <StyledTableCell component="th" scope="row" style={{ color: "white" }}>
                                        {index + 1}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">{subject.subName}</StyledTableCell>
                                    <StyledTableCell align="center">{subject.subCode}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        {subject.teachers && subject.teachers.length > 0 ? (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                                                {subject.teachers.map((teacher, idx) => (
                                                    <Chip
                                                        key={idx}
                                                        label={teacher.name}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        ) : (
                                            <Chip
                                                label="No teachers"
                                                size="small"
                                                color="default"
                                                variant="outlined"
                                            />
                                        )}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        {situation === "Norm" ?
                                            <GreenButton variant="contained"
                                                onClick={() => navigate("/Admin/teachers/addteacher/" + subject._id)}>
                                                Choose
                                            </GreenButton>
                                            :
                                            <GreenButton variant="contained" disabled={loader}
                                                onClick={() => updateSubjectHandler(teacherID, subject._id)}>
                                                {loader ? (
                                                    <div className="load"></div>
                                                ) : (
                                                    'Assign to Teacher'
                                                )}
                                            </GreenButton>}
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        </Paper >
    );
};

export default ChooseSubject;