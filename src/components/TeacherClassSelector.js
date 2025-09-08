import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Divider, Paper } from '@mui/material';
import { useClass } from '../context/ClassContext';
import styled from 'styled-components';

const ClassSelectorContainer = styled(Box)`
  margin-bottom: 16px;
  padding: 8px;
`;

const NoClassesMessage = styled(Typography)`
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 8px;
`;

const TeacherClassSelector = () => {
    const { teacherClasses, selectedClass, changeClass, loading } = useClass();

    // Handle class change
    const handleClassChange = (event) => {
        const classId = event.target.value;
        changeClass(classId);
    };

    // If no classes are assigned or still loading
    if (loading) {
        return (
            <ClassSelectorContainer>
                <Typography variant="subtitle1">Loading classes...</Typography>
            </ClassSelectorContainer>
        );
    }

    if (!teacherClasses || teacherClasses.length === 0) {
        return (
            <ClassSelectorContainer>
                <NoClassesMessage>
                    No classes assigned. Please contact your administrator to assign subjects to you.
                </NoClassesMessage>
            </ClassSelectorContainer>
        );
    }

    // If only one class is assigned, don't show selector
    if (teacherClasses.length === 1) {
        return (
            <ClassSelectorContainer>
                <Divider sx={{ my: 1 }} />
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 'bold',
                        mb: 1,
                        color: 'primary.main'
                    }}
                >
                    Your Class
                </Typography>
                <Paper elevation={1} sx={{ p: 1, backgroundColor: 'rgba(25, 118, 210, 0.08)' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {selectedClass?.sclassName}
                    </Typography>
                </Paper>
            </ClassSelectorContainer>
        );
    }

    return (
        <ClassSelectorContainer>
            <Divider sx={{ my: 1 }} />
            <Typography
                variant="subtitle2"
                sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    color: 'primary.main'
                }}
            >
                Your Classes
            </Typography>
            <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Select Class</InputLabel>
                <Select
                    value={selectedClass ? selectedClass._id : ''}
                    onChange={handleClassChange}
                    label="Select Class"
                >
                    {teacherClasses.map((classObj) => (
                        <MenuItem key={classObj._id} value={classObj._id}>
                            {classObj.sclassName}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            {selectedClass && (
                <Paper elevation={1} sx={{ mt: 1, p: 1, backgroundColor: 'rgba(25, 118, 210, 0.08)' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Active Class: {selectedClass.sclassName}
                    </Typography>
                </Paper>
            )}
        </ClassSelectorContainer>
    );
};

export default TeacherClassSelector;