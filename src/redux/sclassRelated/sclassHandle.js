import axios from '../../api/axiosInstance';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    getStudentsSuccess,
    detailsSuccess,
    getFailedTwo,
    getSubjectsSuccess,
    getSubDetailsSuccess,
    getSubDetailsRequest,
    addClass
} from './sclassSlice';

export const getAllSclasses = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        if (!id) {
            console.warn('No admin ID provided to getAllSclasses');
            dispatch(getFailedTwo('Admin ID is required'));
            return;
        }

        console.log('Fetching classes for admin:', id);
        const result = await axios.get(`/SclassList/${id}`);
        
        console.log('Classes API response:', result.data);
        if (result.data.message === 'No classes found' || !result.data) {
            dispatch(getSuccess([]));
        } else if (result.data.message) {
            dispatch(getFailedTwo(result.data.message));
        } else {
            dispatch(getSuccess(Array.isArray(result.data) ? result.data : [result.data]));
        }
    } catch (error) {
        console.error('Error fetching classes:', error);
        dispatch(getError(error.response?.data?.message || error.message));
    }
}

export const addSclass = (classData) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.post('/SclassCreate', classData);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(addClass(result.data));
            // After adding class successfully, refresh the list
            dispatch(getAllSclasses(classData.adminID, 'Sclass'));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getClassStudents = (id, adminId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        // Don't make the API call if id is undefined/null/empty
        if (!id || id === 'undefined' || id === 'null') {
            dispatch(getFailedTwo('Invalid class ID'));
            return;
        }

        let url = `/Sclass/Students/${id}`;
        // Extra defensive: Only add adminId if it is a non-empty string, not undefined/null, not the string 'undefined', and not empty after trimming
        if (adminId && typeof adminId === 'string' && adminId.trim() !== '' && adminId !== 'undefined' && adminId !== 'null') {
            url += `?adminId=${adminId}`;
        }
        const result = await axios.get(url);
        if (result.data.message) {
            dispatch(getFailedTwo(result.data.message));
        } else {
            dispatch(getStudentsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getClassDetails = (classInfo) => async (dispatch) => {
    dispatch(getRequest());
    
    const maxRetries = 3;
    let retryCount = 0;
    
    const fetchWithRetry = async () => {
        try {
            // Handle case where classInfo is an object (from coordinator's assignedClass)
            const classId = typeof classInfo === 'object' ? classInfo._id : classInfo;
            
            // Don't make the API call if classId is undefined/null/empty
            if (!classId || classId === 'undefined' || classId === 'null') {
                dispatch(getFailed('Invalid class ID'));
                return;
            }

            const result = await axios.get(`/Sclass/${classId}`);
            if (result.data.message) {
                dispatch(getFailed(result.data.message));
            } else {
                dispatch(detailsSuccess(result.data));
            }
        } catch (error) {
            console.error('Error fetching class details:', error);
            
            // If it's a startup error and we haven't exceeded retries
            if (error.message?.includes('starting up') && retryCount < maxRetries) {
                retryCount++;
                console.log(`Retrying fetch class details (${retryCount}/${maxRetries})...`);
                // Wait 5 seconds before retrying
                await new Promise(resolve => setTimeout(resolve, 5000));
                return fetchWithRetry();
            }
            
            dispatch(getError(error.response?.data?.message || error.message));
        }
    };

    await fetchWithRetry();
}

export const getSubjectList = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`/${address}/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSubjectsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getTeacherFreeClassSubjects = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`/FreeSubjectList/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSubjectsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getSubjectDetails = (id, address) => async (dispatch) => {
    dispatch(getSubDetailsRequest());

    try {
        const result = await axios.get(`/${address}/${id}`);
        if (result.data) {
            dispatch(getSubDetailsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}