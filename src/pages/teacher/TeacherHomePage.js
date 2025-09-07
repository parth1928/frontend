import { Container, Grid, Paper } from '@mui/material'
import SeeNotice from '../../components/SeeNotice';
import CountUp from 'react-countup';
import styled from 'styled-components';
import Students from "../../assets/img1.png";
import Lessons from "../../assets/subjects.svg";
import axios from '../../api/axiosInstance';
import { getClassStudents, getSubjectDetails } from '../../redux/sclassRelated/sclassHandle';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useSubject } from '../../context/SubjectContext';
import { useClass } from '../../context/ClassContext';

const TeacherHomePage = () => {
    const dispatch = useDispatch();

    const { currentUser } = useSelector((state) => state.user);
    const { subjectDetails, sclassStudents } = useSelector((state) => state.sclass);
    const { selectedSubject } = useSubject();
    const { selectedClass } = useClass();

    const [lecturesTaken, setLecturesTaken] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const classID = selectedClass?._id || currentUser?.teachSclass?._id;
    const subjectID = selectedSubject?._id; // Use the selected subject from context

    // Fetch attendance data to calculate lectures taken
    const fetchLecturesTaken = async () => {
        if (!classID || !subjectID) {
            console.log("Missing classID or subjectID", { classID, subjectID });
            return;
        }
        
        setLoading(true);
        try {
            console.log(`Fetching lectures count for class=${classID}, subject=${subjectID}`);
            console.log(`Fetching lectures count for class=${classID}, subject=${subjectID}`);
            const response = await axios.get(`/attendance/lectures-count/${classID}/${subjectID}`);
            console.log("Lectures count API response:", response.data);
            
            if (response.data && typeof response.data.lectureCount === 'number') {
                setLecturesTaken(response.data.lectureCount);
                setError(null);
                console.log(`Set lectures taken to ${response.data.lectureCount}`);
            } else {
                console.warn("Invalid lectureCount in response:", response.data);
                setError("Invalid response from server");
            }
        } catch (error) {
            console.error("Error fetching lectures count:", error);
            setError("Failed to fetch lecture count");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser && classID && subjectID) {
            dispatch(getSubjectDetails(subjectID, "Subject"));
            dispatch(getClassStudents(classID, currentUser?.school?._id));
            fetchLecturesTaken();
        }
    }, [dispatch, currentUser, classID, subjectID]);

    const numberOfStudents = sclassStudents && Array.isArray(sclassStudents) ? sclassStudents.length : 0;
    const totalSessions = subjectDetails && subjectDetails.sessions ? subjectDetails.sessions : 0;
    const lecturesLeft = Math.max(0, totalSessions - lecturesTaken);

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4} lg={4}>
                        <StyledPaper>
                            <img src={Students} alt="Students" />
                            <Title>
                                Class Students
                            </Title>
                            <Data start={0} end={numberOfStudents} duration={2.5} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={4} lg={4}>
                        <StyledPaper>
                            <img src={Lessons} alt="Lessons" />
                            <Title>
                                Lectures Left
                            </Title>
                            <Data start={0} end={lecturesLeft} duration={3} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={4} lg={4}>
                        <StyledPaper>
                            <img src={Lessons} alt="Lectures Taken" />
                            <Title>
                                Lectures Taken
                            </Title>
                            {loading ? (
                                <LoadingText>Loading...</LoadingText>
                            ) : error ? (
                                <ErrorText>{error}</ErrorText>
                            ) : (
                                <Data start={0} end={lecturesTaken} duration={3} />
                            )}
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <SeeNotice />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}

const StyledPaper = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 200px;
  justify-content: space-between;
  align-items: center;
  text-align: center;
`;

const Title = styled.p`
  font-size: 1.25rem;
`;

const Data = styled(CountUp)`
  font-size: calc(1.3rem + .6vw);
  color: green;
`;

const LoadingText = styled.p`
  font-size: calc(1.1rem + .5vw);
  color: #777;
`;

const ErrorText = styled.p`
  font-size: calc(0.9rem + .4vw);
  color: #d32f2f;
`;

export default TeacherHomePage