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
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    // Fetch complete subject data when currentUser changes
    useEffect(() => {
        const fetchSubjectDetails = async () => {
            if (currentUser && currentUser.teachSubjects && currentUser.teachSubjects.length > 0) {
                try {
                    // Get detailed subject information using the teacher-specific endpoint
                    const response = await axios.get(`${apiBaseUrl}/TeacherSubjects/${currentUser._id}`);
                    console.log('Fetched subject details:', response.data);
                    
                    if (response.data && Array.isArray(response.data)) {
                        setTeacherSubjects(response.data);
                        
                        // If no subject is selected yet, default to first subject
                        if (response.data.length > 0 && !selectedSubject) {
                            setSelectedSubject(response.data[0]);
                        }
                    } else {
                        console.error('Invalid subject data received:', response.data);
                        setTeacherSubjects([]);
                        setSelectedSubject(null);
                    }
                } catch (error) {
                    console.error('Error fetching subject details:', error);
                    setTeacherSubjects([]);
                    setSelectedSubject(null);
                } finally {
                    setLoading(false);
                }
            } else {
                setTeacherSubjects([]);
                setSelectedSubject(null);
                setLoading(false);
            }
        };

        fetchSubjectDetails();
    }, [currentUser, apiBaseUrl]);

    // Filter subjects when selected class changes
    useEffect(() => {
        if (selectedClass && teacherSubjects.length > 0) {
            const subjects = teacherSubjects.filter(subject => 
                subject.sclassName && subject.sclassName._id === selectedClass._id
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
            setFilteredSubjects(teacherSubjects);
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