import React, { useEffect } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Divider, Paper } from '@mui/material';
import { useSubject } from '../context/SubjectContext';
import { useClass } from '../context/ClassContext';
import styled from 'styled-components';

const SubjectSelectorContainer = styled(Box)`
  margin-bottom: 16px;
  padding: 8px;
`;

const NoSubjectsMessage = styled(Typography)`
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 8px;
`;

const TeacherSubjectSelector = () => {
    const { teacherSubjects, selectedSubject, changeSubject, loading, allSubjects } = useSubject();
    const { selectedClass, changeClass } = useClass();

    // Handle subject change
    const handleSubjectChange = (event) => {
        const subjectId = event.target.value;
        changeSubject(subjectId);
        
        // Auto-select the corresponding class
        const subject = allSubjects.find(s => s._id === subjectId);
        if (subject && subject.sclassName && (!selectedClass || subject.sclassName._id !== selectedClass._id)) {
            changeClass(subject.sclassName._id);
        }
    };

    // If no subjects are assigned or still loading
    if (loading) {
        return (
            <SubjectSelectorContainer>
                <Typography variant="subtitle1">Loading subjects...</Typography>
            </SubjectSelectorContainer>
        );
    }

    if (!teacherSubjects || teacherSubjects.length === 0) {
        return (
            <SubjectSelectorContainer>
                <NoSubjectsMessage>
                    {allSubjects && allSubjects.length > 0 
                        ? 'No subjects for this class. Please contact your administrator to assign subjects to you.' 
                        : 'No subjects assigned. Please contact your administrator to assign subjects to you.'}
                </NoSubjectsMessage>
            </SubjectSelectorContainer>
        );
    }

    return (
        <SubjectSelectorContainer>
            <Divider sx={{ my: 1 }} />
            <Typography
                variant="subtitle2"
                sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    color: 'primary.main'
                }}
            >
                Your Subjects {selectedClass && `(${selectedClass.sclassName})`}
            </Typography>
            <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Select Subject</InputLabel>
                <Select
                    value={selectedSubject ? selectedSubject._id : ''}
                    onChange={handleSubjectChange}
                    label="Select Subject"
                >
                    {teacherSubjects.map((subject) => (
                        <MenuItem key={subject._id} value={subject._id}>
                            {subject.subName} - {subject.subCode}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            {selectedSubject && (
                <Paper elevation={1} sx={{ mt: 1, p: 1, backgroundColor: 'rgba(25, 118, 210, 0.08)' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Active Subject: {selectedSubject.subName}
                    </Typography>
                    <Typography variant="caption" display="block">
                        Code: {selectedSubject.subCode}
                    </Typography>
                    <Typography variant="caption" display="block">
                        Sessions: {selectedSubject.sessions}
                    </Typography>
                    <Typography variant="caption" display="block">
                        Class: {selectedSubject.sclassName?.sclassName}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ color: selectedSubject.isLab ? 'success.main' : 'text.secondary' }}>
                        {selectedSubject.isLab ? 'Lab Subject' : 'Regular Subject'}
                    </Typography>
                </Paper>
            )}
        </SubjectSelectorContainer>
    );
};

export default TeacherSubjectSelector;