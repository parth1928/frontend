import React, { createContext, useState, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useClass } from './ClassContext';

// Create the subject context
const SubjectContext = createContext();

// Custom hook for using the subject context
export const useSubject = () => {
    return useContext(SubjectContext);
};

// Subject context provider component
export const SubjectProvider = ({ children }) => {
    const { currentUser } = useSelector(state => state.user);
    const { selectedClass } = useClass();
    const [teacherSubjects, setTeacherSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Get the base URL from environment or use the default
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://backend-a2q3.onrender.com';

    // Fetch complete subject data when currentUser changes
    useEffect(() => {
        const fetchSubjectDetails = async () => {
            if (!currentUser || !currentUser._id) {
                setTeacherSubjects([]);
                setSelectedSubject(null);
                setLoading(false);
                return;
            }

            try {
                // Always try to get detailed subject information using the new teacher-specific assignments endpoint
                const response = await axios.get(`${apiBaseUrl}/TeacherSubjectAssignments/${currentUser._id}`);
                console.log('SubjectContext: Fetched teacher subject assignments:', response.data);
                
                if (response.data && response.data.assignments && Array.isArray(response.data.assignments)) {
                    // Transform the assignments data to match the expected subject format
                    const transformedSubjects = response.data.assignments.map(assignment => ({
                        ...assignment.subject,
                        assignmentId: assignment._id,
                        classId: assignment.sclass._id,
                        className: assignment.sclass.sclassName,
                        batch: assignment.batch,
                        schedule: assignment.schedule,
                        isActive: assignment.isActive
                    }));
                    
                    console.log('SubjectContext: Transformed subjects:', transformedSubjects.length);
                    setTeacherSubjects(transformedSubjects);
                    
                    // If no subject is selected yet, default to first subject
                    if (transformedSubjects.length > 0 && !selectedSubject) {
                        setSelectedSubject(transformedSubjects[0]);
                    }
                } else {
                    console.log('SubjectContext: No assignments found or invalid response');
                    setTeacherSubjects([]);
                    setSelectedSubject(null);
                    
                    // If no assignments found, try to fall back to old system data
                    if (currentUser.teachSubjects && currentUser.teachSubjects.length > 0) {
                        console.log('SubjectContext: Falling back to old system teachSubjects');
                        try {
                            // Get subject details for old system
                            const subjectPromises = currentUser.teachSubjects.map(subjectId => 
                                axios.get(`${apiBaseUrl}/Subject/${subjectId}`)
                                    .catch(error => {
                                        console.error('SubjectContext: Error fetching subject', subjectId, ':', error);
                                        return null;
                                    })
                            );
                            
                            const subjectResponses = await Promise.all(subjectPromises);
                            const validSubjects = subjectResponses
                                .filter(response => response && response.data && !response.data.message)
                                .map(response => response.data);
                            
                            if (validSubjects.length > 0) {
                                // Transform to match expected format
                                const transformedSubjects = validSubjects.map(subject => ({
                                    ...subject,
                                    assignmentId: subject._id,
                                    classId: subject.sclassName && typeof subject.sclassName === 'object' 
                                        ? subject.sclassName._id 
                                        : subject.sclassName,
                                    className: subject.sclassName && typeof subject.sclassName === 'object' 
                                        ? subject.sclassName.sclassName 
                                        : 'Unknown Class',
                                    batch: null,
                                    schedule: null,
                                    isActive: true
                                }));
                                
                                setTeacherSubjects(transformedSubjects);
                                setSelectedSubject(transformedSubjects[0]);
                            }
                        } catch (fallbackError) {
                            console.error('SubjectContext: Fallback fetch failed:', fallbackError);
                        }
                    }
                }
            } catch (error) {
                console.error('SubjectContext: Error fetching subject details:', error);
                setTeacherSubjects([]);
                setSelectedSubject(null);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjectDetails();
    }, [currentUser, apiBaseUrl]);

    // Filter subjects when selected class changes
    useEffect(() => {
        if (selectedClass && teacherSubjects.length > 0) {
            const subjects = teacherSubjects.filter(subject => 
                subject.classId === selectedClass._id
            );
            
            setFilteredSubjects(subjects);
            
            // If current selected subject is not in the filtered list, select the first one from filtered list
            if (subjects.length > 0) {
                const currentSubjectInClass = subjects.find(s => selectedSubject && s._id === selectedSubject._id);
                if (!currentSubjectInClass) {
                    setSelectedSubject(subjects[0]);
                    localStorage.setItem('selectedSubjectId', subjects[0]._id);
                }
            } else {
                // No subjects for this class, clear selection
                setSelectedSubject(null);
                localStorage.removeItem('selectedSubjectId');
            }
        } else {
            // If no class is selected, show all subjects (for cases where class loading failed)
            setFilteredSubjects(teacherSubjects);
            if (teacherSubjects.length > 0 && !selectedSubject) {
                setSelectedSubject(teacherSubjects[0]);
                localStorage.setItem('selectedSubjectId', teacherSubjects[0]._id);
            }
        }
    }, [selectedClass, teacherSubjects, selectedSubject]);

    // Function to change the selected subject
    const changeSubject = (subjectId) => {
        const subject = teacherSubjects.find(s => s._id === subjectId);
        if (subject) {
            setSelectedSubject(subject);
            // Store the selected subject in localStorage for persistence
            localStorage.setItem('selectedSubjectId', subject._id);
            return true;
        }
        return false;
    };

    // Check localStorage for previously selected subject on initial load
    useEffect(() => {
        const storedSubjectId = localStorage.getItem('selectedSubjectId');
        if (storedSubjectId && teacherSubjects.length > 0) {
            const subject = teacherSubjects.find(s => s._id === storedSubjectId);
            if (subject) {
                setSelectedSubject(subject);
            }
        }
    }, [teacherSubjects]);

    // Value object to be provided by the context
    const value = {
        teacherSubjects: filteredSubjects,
        allSubjects: teacherSubjects,
        selectedSubject,
        changeSubject,
        loading
    };

    return (
        <SubjectContext.Provider value={value}>
            {children}
        </SubjectContext.Provider>
    );
};