import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext({});

// Create a dedicated axios instance
const authAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Initialize token immediately if it exists
const token = localStorage.getItem('token');
if (token) {
    authAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize token from localStorage and set axios header - REMOVED (handled at module level)

    // Load user on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        const loadUser = async () => {
            try {
                const response = await authAxios.get('/auth/profile');
                if (response.data.success) {
                    setUser(response.data.data);
                } else {
                    // Clear invalid token
                    localStorage.removeItem('token');
                    delete authAxios.defaults.headers.common['Authorization'];
                }
            } catch (error) {
                console.error('Auth error:', error);
                localStorage.removeItem('token');
                delete authAxios.defaults.headers.common['Authorization'];
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            // Don't send existing token for login
            const tempAxios = axios.create({
                baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
            });

            const response = await tempAxios.post('/auth/login', { email, password });

            if (response.data.success) {
                const { user: userData, token } = response.data.data;

                // Store token
                localStorage.setItem('token', token);
                authAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Update state
                setUser(userData);
                toast.success('Login successful');
                return { success: true, user: userData };
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    const register = async (userData) => {
        try {
            const tempAxios = axios.create({
                baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
            });

            const response = await tempAxios.post('/auth/register', userData);

            if (response.data.success) {
                const { user: userData, token } = response.data.data;

                localStorage.setItem('token', token);
                authAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(userData);

                toast.success('Registration successful');
                return { success: true, user: userData };
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Registration failed';
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete authAxios.defaults.headers.common['Authorization'];
        setUser(null);
        // toast.success('Logged out successfully'); // Removed duplicate toast
    };

    const updateProfile = async (userData) => {
        try {
            const response = await authAxios.put('/auth/profile', userData);
            if (response.data.success) {
                setUser(response.data.data);
                toast.success('Profile updated successfully');
                return { success: true, user: response.data.data };
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Update failed';
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    const hasRole = (roles) => {
        if (!user || !user.role) return false;
        return Array.isArray(roles) ? roles.includes(user.role) : roles === user.role;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                updateProfile,
                hasRole,
                isAuthenticated: !!user && !!localStorage.getItem('token'),
                authAxios // Export axios instance for other components
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};