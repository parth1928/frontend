import axios from '../../api/axiosInstance';
import {
    getRequest,
    doneSuccess,
    getFailed,
    getError,
} from '../userRelated/userSlice';

export const getAllCoordinators = (adminId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`/ClassCoordinators/${adminId}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
};

export const getClassDetails = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`/Coordinator/class/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
};

export const getStudentsAttendance = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`/Coordinator/attendance/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
};

export const downloadAttendanceReport = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`/Coordinator/attendance/download/${id}`, {
            responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'attendance_report.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        dispatch(doneSuccess(null));
    } catch (error) {
        dispatch(getError(error));
    }
};
