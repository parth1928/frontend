import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'https://backend-a2q3.onrender.com',
    withCredentials: false, // Changed to false since we're using token-based auth
    timeout: 60000, // Increased timeout for Render's cold starts
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
});

// Add a request interceptor
instance.interceptors.request.use(
    (config) => {
        // Add auth token to headers if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add timestamp to prevent caching
        config.params = {
            ...config.params,
            _t: Date.now()
        };

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
            throw new Error('Server is starting up. Please wait a moment and try again (this is normal for free hosting).');
        }

        if (!error.response) {
            console.error('Network/Connection error:', error);
            if (error.message.includes('Network Error')) {
                throw new Error('Cannot connect to server. Please check your internet connection and try again.');
            }
            throw new Error('Connection failed. Please try again.');
        }

        console.error('Response error:', {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
        });

        switch (error.response.status) {
            case 401:
                // Clear auth data and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/';
                }
                throw new Error('Session expired. Please login again.');
            case 403:
                throw new Error('Access denied. Please check your credentials.');
            case 404:
                throw new Error('Service not found. Please try again later.');
            case 500:
                throw new Error('Server error. Please try again later.');
            case 429:
                throw new Error('Too many requests. Please wait a moment and try again.');
            default:
                throw new Error(error.response?.data?.message || 'Something went wrong. Please try again.');
        }
    }
);

export default instance;
