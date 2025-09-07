import React, { createContext, useState, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

// Create the class context
const ClassContext = createContext();

// Custom hook for using the class context
export const useClass = () => {
    return useContext(ClassContext);
};

// Class context provider component
export const ClassProvider = ({ children }) => {
    const { currentUser } = useSelector(state => state.user);
    const [teacherClasses, setTeacherClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Get the base URL from environment or use the default
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://backend-a2q3.onrender.com';

    // Fetch class data when currentUser changes
    useEffect(() => {
        const fetchClassDetails = async () => {
            if (!currentUser) {
                setTeacherClasses([]);
                setSelectedClass(null);
                setLoading(false);
                return;
            }

            try {
                // For backward compatibility - if teachClasses doesn't exist yet, use teachSclass
                if (!currentUser.teachClasses || currentUser.teachClasses.length === 0) {
                    if (currentUser.teachSclass) {
                        // Get class details
                        const response = await axios.get(`${apiBaseUrl}/Sclass/${currentUser.teachSclass}`);
                        if (response.data && !response.data.message) {
                            setTeacherClasses([response.data]);
                            setSelectedClass(response.data);
                        } else {
                            setTeacherClasses([]);
                            setSelectedClass(null);
                        }
                    } else {
                        setTeacherClasses([]);
                        setSelectedClass(null);
                    }
                } else {
                    // Use the new teachClasses array (once implemented)
                    // Get class details for each class
                    const classPromises = currentUser.teachClasses.map(classId => 
                        axios.get(`${apiBaseUrl}/Sclass/${classId}`)
                    );
                    
                    const classResponses = await Promise.all(classPromises);
                    const validClasses = classResponses
                        .filter(response => response.data && !response.data.message)
                        .map(response => response.data);
                    
                    setTeacherClasses(validClasses);
                    if (validClasses.length > 0) {
                        setSelectedClass(validClasses[0]);
                    } else {
                        setSelectedClass(null);
                    }
                }
            } catch (error) {
                console.error('Error fetching class details:', error);
                setTeacherClasses([]);
                setSelectedClass(null);
            } finally {
                setLoading(false);
            }
        };

        fetchClassDetails();
    }, [currentUser, apiBaseUrl]);

    // Function to change the selected class
    const changeClass = (classId) => {
        const classObj = teacherClasses.find(c => c._id === classId);
        if (classObj) {
            setSelectedClass(classObj);
            // Store the selected class in localStorage for persistence
            localStorage.setItem('selectedClassId', classObj._id);
            return true;
        }
        return false;
    };

    // Check localStorage for previously selected class on initial load
    useEffect(() => {
        const storedClassId = localStorage.getItem('selectedClassId');
        if (storedClassId && teacherClasses.length > 0) {
            const classObj = teacherClasses.find(c => c._id === storedClassId);
            if (classObj) {
                setSelectedClass(classObj);
            }
        }
    }, [teacherClasses]);

    // Value object to be provided by the context
    const value = {
        teacherClasses,
        selectedClass,
        changeClass,
        loading
    };

    return (
        <ClassContext.Provider value={value}>
            {children}
        </ClassContext.Provider>
    );
};