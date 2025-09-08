import instance from '../../api/axiosInstance';
import axios from 'axios';
import {
    authRequest,
    stuffAdded,
    authSuccess,
    authFailed,
    authError,
    authLogout,
    doneSuccess,
    getRequest,
    getFailed,
    getError,
} from './userSlice';

// Get the base URL from environment or use the default
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://backend-a2q3.onrender.com';

export const loginUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());
    console.log('Login attempt:', { role, fields: { ...fields, password: '***' } });

    try {
        if (!role) {
            dispatch(authFailed('Role is required'));
            return;
        }

        // Log the complete request URL
        const loginUrl = `${apiBaseUrl}/${role}Login`;
        console.log('Login URL:', loginUrl);

        // Use direct axios call to ensure no circular dependencies
        const result = await axios.post(loginUrl, fields, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true
        });
        
        console.log('Login response:', result.data);

        if (!result.data) {
            dispatch(authFailed('No response from server'));
            return;
        }

        // Handle error messages from server
        if (result.data.error) {
            dispatch(authFailed(result.data.error));
            return;
        }

        // Handle message-only responses (usually errors)
        if (result.data.message && !result.data._id) {
            dispatch(authFailed(result.data.message));
            return;
        }

        // Validate required user data
        if (!result.data._id) {
            dispatch(authFailed('Invalid user data received'));
            return;
        }

        // Create user object with all required fields
        const userData = {
            ...result.data,
            role: result.data.role || role
        };

    // ...removed for production...
        dispatch(authSuccess(userData));
    } catch (error) {
        let errorMessage = 'Login failed. ';

        if (error.code === 'ECONNABORTED') {
            errorMessage += 'Server is starting up. Please try again in a few moments.';
        } else if (!error.response) {
            errorMessage += 'Unable to reach the server. Please check your connection and try again.';
        } else {
            errorMessage += error.response?.data?.message || error.message || 'Please try again.';
        }

        dispatch(authError(errorMessage));
    }
};

export const registerUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());
    console.log('Register attempt:', { role, fields: { ...fields, password: '***' } });

    try {
        // Log the complete request URL
        const registerUrl = `${apiBaseUrl}/${role}Reg`;
        console.log('Register URL:', registerUrl);

        // Use direct axios call to ensure no circular dependencies
        const result = await axios.post(registerUrl, fields, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true
        });
        
        console.log('Register response:', result.data);

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
    // ...removed for production...
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
        // Get base URL from environment or default
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://backend-a2q3.onrender.com';
        // Construct full URL
        const url = `${baseUrl}/${address}Create`;
        console.log('Making API request to:', url);
        
        const result = await axios.post(url, fields, {
            headers: { 'Content-Type': 'application/json' },
        });

        console.log('API response:', result.data);

        if (result.data.message) {
            dispatch(authFailed(result.data.message));
        } else {
            dispatch(stuffAdded(result.data));
        }
    } catch (error) {
        console.error('API error:', error);
        dispatch(authError(error.response?.data?.message || error.message));
    }
};

export const updateTeacherSubject = (fields) => async (dispatch) => {
    dispatch(getRequest());
    try {
        // Get base URL from environment or default
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://backend-a2q3.onrender.com';
        // Construct full URL
        const url = `${baseUrl}/TeacherSubject`;
        console.log('Making API request to:', url);
        
        const result = await axios.put(url, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        
        console.log('API response:', result.data);
        
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            // After successful assignment, fetch the updated teacher details
            const teacherId = fields.teacherId;
            const teacherUrl = `${baseUrl}/Teacher/${teacherId}`;
            console.log('Fetching updated teacher details from:', teacherUrl);
            
            try {
                const teacherResult = await axios.get(teacherUrl);
                console.log('Updated teacher details:', teacherResult.data);
                dispatch(doneSuccess(teacherResult.data));
            } catch (teacherError) {
                console.error('Error fetching updated teacher details:', teacherError);
                // Fallback to the original response
                dispatch(doneSuccess(result.data));
            }
        }
    } catch (error) {
        console.error('API error:', error);
        dispatch(getError(error.response?.data?.message || error.message));
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