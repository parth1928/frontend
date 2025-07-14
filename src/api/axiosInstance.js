import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://backend-a2q3.onrender.com',
    withCredentials: true,
    timeout: 20000, // Increasing timeout to 20 seconds since Render free tier can be slow
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
        console.log('Response received:', response.status);
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout - server might be starting up (common with free tier)');
            return Promise.reject(new Error('The server is taking longer than usual to respond. Please try again in a few moments.'));
        }

        if (!error.response) {
            console.error('Network error:', error);
            return Promise.reject(new Error('Unable to reach the server. Please check your connection and try again.'));
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
                return Promise.reject(new Error('Server error. Our team has been notified.'));
            default:
                return Promise.reject(new Error(error.response?.data?.message || 'Something went wrong. Please try again.'));
        }
    }
);

export default instance;
