import React, { useEffect } from 'react';
import { getTeacherDetails } from '../../../redux/teacherRelated/teacherHandle';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Container, Typography, Box, Grid, Card, CardContent, Chip, Divider } from '@mui/material';

const TeacherDetails = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { loading, teacherDetails, error } = useSelector((state) => state.teacher);

    const teacherID = params.id;

    useEffect(() => {
        dispatch(getTeacherDetails(teacherID));
    }, [dispatch, teacherID]);

    if (error) {
        console.log(error);
    }

    const handleAssignSubjects = () => {
        navigate(`/Admin/teachers/assignsubjects/${teacherID}`);
    };

    const handleAssignClasses = () => {
        navigate(`/Admin/teachers/assignclasses/${teacherID}`);
    };

    const hasMultipleSubjects = Array.isArray(teacherDetails?.teachSubjects) && teacherDetails.teachSubjects.length > 0;

    return (
        <>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Typography>Loading...</Typography>
                </Box>
            ) : (
                <Container>
                    <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
                        Teacher Details
                    </Typography>
                    
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="h6">
                                        Name: {teacherDetails?.name}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="h6">
                                        Email: {teacherDetails?.email}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" gutterBottom>
                                        Primary Class: {teacherDetails?.teachSclass?.sclassName || "Not assigned"}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Assigned Subjects</Typography>
                                <Button variant="contained" onClick={handleAssignSubjects}>
                                    {hasMultipleSubjects ? 'Edit Subjects' : 'Assign Subjects'}
                                </Button>
                            </Box>
                            
                            {hasMultipleSubjects ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {teacherDetails.teachSubjects.map((subject, index) => (
                                        <Chip 
                                            key={index} 
                                            label={subject.subName || subject} 
                                            color="primary" 
                                            variant="outlined" 
                                        />
                                    ))}
                                </Box>
                            ) : (
                                <Typography>No subjects assigned yet</Typography>
                            )}
                        </CardContent>
                    </Card>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button variant="outlined" onClick={() => navigate('/Admin/teachers')}>
                            Back to Teachers
                        </Button>
                        <Button variant="contained" onClick={handleAssignClasses}>
                            Manage Classes
                        </Button>
                    </Box>
                </Container>
            )}
        </>
    );
};

export default TeacherDetails;