import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
} from './subjectSlice';
const REACT_APP_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const getSubjectList = ({ classId }) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/ClassSubjects/${classId}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message));
    }
};
