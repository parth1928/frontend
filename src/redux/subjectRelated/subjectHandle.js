import instance from '../../api/axiosInstance';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    deleteRequest,
    deleteSuccess,
    deleteFailed,
    deleteError,
    resetDeleteState
} from './subjectSlice';

export const getSubjectList = ({ classId }) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await instance.get(`/ClassSubjects/${classId}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message));
    }
};

export const deleteSubject = (id) => async (dispatch) => {
    dispatch(deleteRequest());

    try {
        console.log('Deleting subject with ID:', id);
        const result = await instance.delete(`/Subject/${id}`);
        console.log('Delete subject API response:', result);
        
        if (result.data.message) {
            dispatch(deleteFailed(result.data.message));
            return { success: false, message: result.data.message };
        } else {
            dispatch(deleteSuccess(id));
            return { success: true };
        }
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete subject';
        console.error('Delete subject error:', errorMsg);
        dispatch(deleteError(errorMsg));
        return { success: false, message: errorMsg };
    }
};

export const deleteAllSubjects = (adminId) => async (dispatch) => {
    dispatch(deleteRequest());

    try {
        console.log('Deleting all subjects for admin:', adminId);
        const result = await instance.delete(`/Subjects/${adminId}`);
        
        if (result.data.message) {
            dispatch(deleteFailed(result.data.message));
            return { success: false, message: result.data.message };
        } else {
            dispatch(deleteSuccess());
            return { success: true };
        }
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete subjects';
        console.error('Delete all subjects error:', errorMsg);
        dispatch(deleteError(errorMsg));
        return { success: false, message: errorMsg };
    }
};
