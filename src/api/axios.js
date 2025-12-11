import axios from 'axios';

const authAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add interceptor to handle 401 errors globally
authAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            delete authAxios.defaults.headers.common['Authorization'];
            // Optional: Redirect to login or just let the app handle the empty user state
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default authAxios;
