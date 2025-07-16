import axios from '../../api/axiosInstance';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
} from './subjectSlice';

export const getSubjectList = ({ classId }) => async (dispatch) => {
    dispatch(getRequest());

    try {
        if (!classId) {
            console.warn('No classId provided to getSubjectList');
            dispatch(getFailed('Class ID is required'));
            return;
        }

        console.log('Fetching subjects for class:', classId);
        const result = await axios.get(`/ClassSubjects/${classId}`);
        
        console.log('Subject API response:', result.data);
        if (result.data.message === 'No subjects found' || !result.data) {
            dispatch(getSuccess([]));
        } else if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(Array.isArray(result.data) ? result.data : [result.data]));
        }
    } catch (error) {
        console.error('Error fetching subjects:', error);
        dispatch(getError(error.response?.data?.message || error.message));
    }
};
