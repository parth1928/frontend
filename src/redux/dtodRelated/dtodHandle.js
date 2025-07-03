import axios from 'axios';
import {
    getDtodRequest,
    getDtodSuccess,
    getDtodFailed,
    getDtodError
} from './dtodSlice';
const REACT_APP_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Accept adminId and classId as arguments
export const getAllDtodStudents = (adminId, classId) => async (dispatch) => {
    dispatch(getDtodRequest());
    try {
        let url = `${REACT_APP_BASE_URL}/dtod_students?`;
        if (adminId) url += `adminId=${adminId}`;
        if (classId) url += `${adminId ? '&' : ''}classId=${classId}`;
        const result = await axios.get(url);
        if (result.data.message) {
            dispatch(getDtodFailed(result.data.message));
        } else {
            dispatch(getDtodSuccess(result.data));
        }
    } catch (error) {
        dispatch(getDtodError(error));
    }
}
