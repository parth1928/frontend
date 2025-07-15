import axios from '../../api/axiosInstance';
import {
    authRequest,
    authSuccess,
    authFailed,
    authError,
    stuffAdded,
    getRequest,
    getFailed,
    getError,
    getSuccess,
    doneSuccess,
    getDeleteSuccess,
} from './userSlice';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://backend-a2q3.onrender.com';

export const loginUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`/${role}Login`, fields, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            withCredentials: false
        });

        if (result.data.role !== role) {
            dispatch(authFailed("Invalid role"));
            return;
        }

        // Store auth token
        const token = result.data.token;
        if (token) {
            localStorage.setItem('token', token);
        }

        const userData = { ...result.data, role: role };
        dispatch(authSuccess(userData));
        localStorage.setItem('user', JSON.stringify(userData));

    } catch (error) {
        console.error('Login error details:', error);

        // Handle specific error cases
        if (!error.response) {
            dispatch(authError("Unable to connect to server. Please check your internet connection and try again."));
            return;
        }

        switch (error.response?.status) {
            case 400:
                dispatch(authFailed("Invalid username or password"));
                break;
            case 401:
                dispatch(authFailed("Invalid credentials"));
                break;
            case 404:
                dispatch(authFailed("User not found"));
                break;
            case 429:
                dispatch(authFailed("Too many login attempts. Please try again later."));
                break;
            case 500:
                dispatch(authError("Server error. Please try again later."));
                break;
            default:
                dispatch(authError(error.response?.data?.message || "Login failed. Please try again."));
        }
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