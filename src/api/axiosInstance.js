import axios from 'axios';

// Debug the API URL that's being used
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://backend-a2q3.onrender.com';
console.log('API Base URL:', apiBaseUrl);

const instance = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
    timeout: 30000, // Increased timeout for Render's free tier cold starts
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add a request interceptor
instance.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url);
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
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout - server might be starting up (common with free tier)');
            return Promise.reject(new Error('Server is starting up. Please try again in a few moments.'));
        }

        if (!error.response) {
            console.error('Network/Connection error:', error);
            if (error.message.includes('Network Error')) {
                return Promise.reject(new Error('Unable to connect to server. Please check your internet connection and try again.'));
            }
            return Promise.reject(new Error('Connection failed. Please try again.'));
        }

        console.error('Response error:', {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
        });

        switch (error.response.status) {
            case 401:
                localStorage.removeItem('user');
                window.location.href = '/';
                return Promise.reject(new Error('Session expired. Please login again.'));
            case 403:
                return Promise.reject(new Error('Access denied. Please check your credentials.'));
            case 404:
                return Promise.reject(new Error('Service not found. Please try again later.'));
            case 500:
                return Promise.reject(new Error('Server error. Please try again later.'));
            default:
                return Promise.reject(new Error(error.response?.data?.message || 'Something went wrong. Please try again.'));
        }
    }
);

export default instance;
