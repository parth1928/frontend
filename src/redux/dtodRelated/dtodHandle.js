import instance from '../../api/axiosInstance';
import {
    getDtodRequest,
    getDtodSuccess,
    getDtodFailed,
    getDtodError
} from './dtodSlice';

// Accept adminId and classId as arguments
export const getAllDtodStudents = (adminId, classId) => async (dispatch) => {
    dispatch(getDtodRequest());
    try {
        let url = `/dtod_students?`;
        if (adminId) url += `adminId=${adminId}`;
        if (classId) url += `${adminId ? '&' : ''}classId=${classId}`;
        const result = await instance.get(url);
        if (result.data.message) {
            dispatch(getDtodFailed(result.data.message));
        } else {
            dispatch(getDtodSuccess(result.data));
        }
    } catch (error) {
        dispatch(getDtodError(error));
    }
}
