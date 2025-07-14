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
        const result = await axios.get(`/SclassList/${id}`);
        if (result.data.message) {
            dispatch(getFailedTwo(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
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

export const getClassDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`/${address}/${id}`);
        if (result.data) {
            dispatch(detailsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
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