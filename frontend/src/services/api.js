import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('treasuryToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token expiration (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Only clear token if we're not already on the login route to avoid loops
            if (window.location.pathname !== '/') {
                localStorage.removeItem('treasuryToken');
                localStorage.removeItem('treasuryUser');
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
