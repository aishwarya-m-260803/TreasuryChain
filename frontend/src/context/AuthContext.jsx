import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('treasuryUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('treasuryToken') || null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (token && user) {
            // Optional: verify token on mount
            api.get('/auth/me').catch(() => {
                logout();
            });
        }
    }, [token, user]);

    const login = async (organization, username, password) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', {
                organization,
                username,
                password
            });

            const { token: newToken, user: userData } = response.data.data;
            
            setToken(newToken);
            setUser(userData);
            
            localStorage.setItem('treasuryToken', newToken);
            localStorage.setItem('treasuryUser', JSON.stringify(userData));
            
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
            return { success: false, message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('treasuryToken');
        localStorage.removeItem('treasuryUser');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!token && !!user,
            isLoading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
