import axios from '../../api/axiosInstance';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    addStudent,
    stuffDone
} from './studentSlice';

export const getAllStudents = (id) => async (dispatch) => {
    dispatch(getRequest());
    console.log('Fetching students for admin:', id);

    try {
        // Don't make the API call if id is undefined/null/empty
        if (!id || id === 'undefined' || id === 'null') {
            dispatch(getFailed('Invalid admin ID'));
            return;
        }

        const result = await axios.get(`/Students/${id}`);
        console.log('Students API response:', result.data);

        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        console.error('Error fetching students:', error);
        dispatch(getError(error.response?.data?.message || error.message));
    }
};

export const getStudentList = (classId) => async (dispatch) => {
    dispatch(getRequest());
    console.log('Fetching students for class:', classId);

    try {
        // Don't make the API call if classId is undefined/null/empty
        if (!classId || classId === 'undefined' || classId === 'null') {
            dispatch(getFailed('Invalid class ID'));
            return;
        }

        const result = await axios.get(`/Sclass/Students/${classId}`);
        console.log('Class students API response:', result.data);

        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        console.error('Error fetching class students:', error);
        dispatch(getError(error.response?.data?.message || error.message));
    }
};

export const addNewStudent = (studentData) => async (dispatch) => {
    dispatch(getRequest());
    console.log('Adding new student:', studentData);

    try {
        const result = await axios.post('/StudentCreate', studentData);
        console.log('Add student API response:', result.data);

        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(addStudent(result.data));
            // Refresh the student list
            if (studentData.adminID) {
                dispatch(getAllStudents(studentData.adminID));
            }
        }
    } catch (error) {
        console.error('Error adding student:', error);
        dispatch(getError(error.response?.data?.message || error.message));
    }
};

export const updateStudentFields = (id, fields, address) => async (dispatch) => {
    dispatch(getRequest());
    console.log('Updating student:', id, 'with fields:', fields);

    try {
        const result = await axios.put(`/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        console.log('Update student API response:', result.data);

        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(stuffDone());
            // Refresh student data if needed
            if (fields.adminID) {
                dispatch(getAllStudents(fields.adminID));
            }
        }
    } catch (error) {
        console.error('Error updating student:', error);
        dispatch(getError(error.response?.data?.message || error.message));
    }
};

export const removeStuff = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    console.log('Removing student:', id);

    try {
        const result = await axios.put(`/${address}/${id}`);
        console.log('Remove student API response:', result.data);

        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(stuffDone());
        }
    } catch (error) {
        console.error('Error removing student:', error);
        dispatch(getError(error.response?.data?.message || error.message));
    }
};

export const getStudentAttendance = (classId) => async (dispatch) => {
    dispatch(getRequest());
    console.log('Fetching attendance for class:', classId);

    try {
        const result = await axios.get(`/Coordinator/attendance/${classId}`);
        console.log('Student attendance API response:', result.data);

        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        console.error('Error fetching attendance:', error);
        dispatch(getError(error.response?.data?.message || error.message));
    }
};