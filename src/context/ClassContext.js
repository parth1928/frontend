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
                // First, try to get classes from subject assignments (new system)
                if (currentUser._id) {
                    console.log('ClassContext: Fetching assignments for teacher:', currentUser._id);
                    // Fetch teacher's subject assignments to get class information
                    const assignmentsResponse = await axios.get(`${apiBaseUrl}/TeacherSubjectAssignments/${currentUser._id}`);
                    console.log('ClassContext: API Response:', assignmentsResponse);
                    console.log('ClassContext: Response data:', assignmentsResponse.data);
                    
                    if (assignmentsResponse.data && assignmentsResponse.data.assignments && Array.isArray(assignmentsResponse.data.assignments)) {
                        console.log('ClassContext: Found assignments:', assignmentsResponse.data.assignments.length);
                        
                        // Get unique class IDs from assignments
                        const classIds = [...new Set(assignmentsResponse.data.assignments.map(assignment => {
                            // Handle different possible structures
                            if (assignment.sclass && typeof assignment.sclass === 'object' && assignment.sclass._id) {
                                console.log('ClassContext: Found class ID from object:', assignment.sclass._id);
                                return assignment.sclass._id;
                            } else if (assignment.sclass && typeof assignment.sclass === 'string') {
                                console.log('ClassContext: Found class ID from string:', assignment.sclass);
                                return assignment.sclass;
                            } else if (assignment.classId) {
                                console.log('ClassContext: Found class ID from classId:', assignment.classId);
                                return assignment.classId;
                            }
                            console.warn('ClassContext: Could not extract class ID from assignment:', assignment);
                            return null;
                        }).filter(id => id !== null))];
                        
                        console.log('ClassContext: Extracted class IDs:', classIds);
                        
                        if (classIds.length > 0) {
                            console.log('ClassContext: Fetching class details for IDs:', classIds);
                            // Fetch class details for each unique class
                            const classPromises = classIds.map(classId => {
                                console.log('ClassContext: Fetching class details for:', classId);
                                return axios.get(`${apiBaseUrl}/Sclass/${classId}`)
                                    .catch(error => {
                                        console.error('ClassContext: Error fetching class', classId, ':', error);
                                        return null;
                                    });
                            });
                            
                            const classResponses = await Promise.all(classPromises);
                            const validClasses = classResponses
                                .filter(response => response && response.data && !response.data.message)
                                .map(response => response.data);
                            
                            console.log('ClassContext: Valid classes found:', validClasses.length);
                            
                            if (validClasses.length > 0) {
                                setTeacherClasses(validClasses);
                                setSelectedClass(validClasses[0]);
                                setLoading(false);
                                return;
                            } else {
                                console.log('ClassContext: No valid classes found after fetching details');
                            }
                        } else {
                            console.log('ClassContext: No valid class IDs found');
                        }
                    } else {
                        console.log('ClassContext: Invalid assignments response structure or no assignments');
                        console.log('ClassContext: Response data type:', typeof assignmentsResponse.data);
                        console.log('ClassContext: Has assignments property:', assignmentsResponse.data ? 'assignments' in assignmentsResponse.data : 'N/A');
                    }
                }

                // Fallback to old system - if teachClasses doesn't exist yet, use teachSclass
                if (!currentUser.teachClasses || currentUser.teachClasses.length === 0) {
                    if (currentUser.teachSclass) {
                        // Handle case where teachSclass might be an object or string
                        const classId = typeof currentUser.teachSclass === 'object' 
                            ? currentUser.teachSclass._id 
                            : currentUser.teachSclass;
                        
                        if (classId && typeof classId === 'string') {
                            // Get class details
                            const response = await axios.get(`${apiBaseUrl}/Sclass/${classId}`);
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
                        // If no old system data, try to fetch from new assignments system
                        console.log('ClassContext: No old system data, trying new system fallback');
                        try {
                            const assignmentsResponse = await axios.get(`${apiBaseUrl}/TeacherSubjectAssignments/${currentUser._id}`);
                            if (assignmentsResponse.data && assignmentsResponse.data.assignments && Array.isArray(assignmentsResponse.data.assignments)) {
                                const classIds = [...new Set(assignmentsResponse.data.assignments.map(assignment => {
                                    if (assignment.sclass && typeof assignment.sclass === 'object' && assignment.sclass._id) {
                                        return assignment.sclass._id;
                                    } else if (assignment.sclass && typeof assignment.sclass === 'string') {
                                        return assignment.sclass;
                                    } else if (assignment.classId) {
                                        return assignment.classId;
                                    }
                                    return null;
                                }).filter(id => id !== null))];
                                
                                if (classIds.length > 0) {
                                    const classPromises = classIds.map(classId => 
                                        axios.get(`${apiBaseUrl}/Sclass/${classId}`)
                                            .catch(error => {
                                                console.error('ClassContext: Error fetching class in fallback:', classId, error);
                                                return null;
                                            })
                                    );
                                    
                                    const classResponses = await Promise.all(classPromises);
                                    const validClasses = classResponses
                                        .filter(response => response && response.data && !response.data.message)
                                        .map(response => response.data);
                                    
                                    if (validClasses.length > 0) {
                                        setTeacherClasses(validClasses);
                                        setSelectedClass(validClasses[0]);
                                        setLoading(false);
                                        return;
                                    }
                                }
                            }
                        } catch (fallbackError) {
                            console.error('ClassContext: Fallback fetch failed:', fallbackError);
                        }
                        
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