import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'https://backend-a2q3.onrender.com',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add a request interceptor
instance.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            console.error('Response error:', error.response);
            // Handle specific error cases
            switch (error.response.status) {
                case 401:
                    // Handle unauthorized
                    localStorage.removeItem('user');
                    window.location.href = '/';
                    break;
                case 403:
                    // Handle forbidden
                    console.error('Forbidden access:', error.response.data);
                    break;
                case 404:
                    // Handle not found
                    console.error('Resource not found:', error.response.data);
                    break;
                default:
                    console.error('Server error:', error.response.data);
                    break;
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
