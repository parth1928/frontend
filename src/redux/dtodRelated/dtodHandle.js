import axios from 'axios';
import {
    getDtodRequest,
    getDtodSuccess,
    getDtodFailed,
    getDtodError
} from './dtodSlice';
const REACT_APP_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const getAllDtodStudents = () => async (dispatch) => {
    dispatch(getDtodRequest());
    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/dtod_students`);
        if (result.data.message) {
            dispatch(getDtodFailed(result.data.message));
        } else {
            dispatch(getDtodSuccess(result.data));
        }
    } catch (error) {
        dispatch(getDtodError(error));
    }
}
