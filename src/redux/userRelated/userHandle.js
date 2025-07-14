import axios from '../../api/axiosInstance';
import {
    authRequest,
    stuffAdded,
    authSuccess,
    authFailed,
    authError,
    authLogout,
    doneSuccess,
    getDeleteSuccess,
    getRequest,
    getFailed,
    getError,
} from './userSlice';

export const loginUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());
    console.log('Attempting login for role:', role, 'with fields:', fields);

    try {
        const result = await axios.post(`/${role}Login`, fields);
        console.log('Login response:', result.data);

        if (!result.data) {
            dispatch(authFailed('No response from server'));
            return;
        }

        if (result.data.message) {
            dispatch(authFailed(result.data.message));
            return;
        }

        if (!result.data.role) {
            result.data.role = role; // Ensure role is set
        }

        dispatch(authSuccess(result.data));
    } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Login failed';
        dispatch(authError(errorMessage));
    }
};

export const registerUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());
    console.log('Attempting registration for role:', role, 'with fields:', fields);

    try {
        const result = await axios.post(`/${role}Reg`, fields);
        console.log('Registration response:', result.data);

        if (!result.data) {
            dispatch(authFailed('No response from server'));
            return;
        }

        if (result.data.message) {
            dispatch(authFailed(result.data.message));
            return;
        }

        if (result.data.schoolName || (role === 'Admin' && result.data)) {
            dispatch(authSuccess(result.data));
        } else if (result.data.school) {
            dispatch(stuffAdded(result.data));
        } else {
            dispatch(authFailed('Registration failed'));
        }
    } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
        dispatch(authError(errorMessage));
    }
};

export const logoutUser = () => (dispatch) => {
    dispatch(authLogout());
};

export const getUserDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        let url;
        if (address === 'D2D') {
            url = `/dtod_students/${id}`;
        } else {
            url = `/${address}/${id}`;
        }
        const result = await axios.get(url);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message));
    }
}

// export const deleteUser = (id, address) => async (dispatch) => {
//     dispatch(getRequest());

//     try {
//         const result = await axios.delete(`${REACT_APP_BASE_URL}/${address}/${id}`);
//         if (result.data.message) {
//             dispatch(getFailed(result.data.message));
//         } else {
//             dispatch(getDeleteSuccess());
//         }
//     } catch (error) {
//         dispatch(getError(error));
//     }
// }


export const deleteUser = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    dispatch(getFailed("Sorry the delete function has been disabled for now."));
}

export const updateUser = (fields, id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.schoolName) {
            dispatch(authSuccess(result.data));
        }
        else {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message));
    }
}

export const addStuff = (fields, address) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`/${address}Create`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (result.data.message) {
            dispatch(authFailed(result.data.message));
        } else {
            dispatch(stuffAdded(result.data));
        }
    } catch (error) {
        dispatch(authError(error.message));
    }
};

export const updateTeacherSubject = (fields) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.put(`/TeacherSubject`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message));
    }
};

export const getClassCoordinators = (adminId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`/ClassCoordinators/${adminId}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message));
    }
};