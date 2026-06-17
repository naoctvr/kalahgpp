const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const authService = {
    // LOGIN
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('user', JSON.stringify(result.user));
                if (result.token) {
                    localStorage.setItem('token', result.token);
                }
                return { success: true, user: result.user };
            } else {
                return { success: false, message: result.message || 'Login gagal.' };
            }
        } catch (error) {
            console.error('Login Error:', error);
            return { success: false, message: 'Gagal terhubung ke server.' };
        }
    },

    // REGISTER
    register: async (userData) => {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('user', JSON.stringify(result.user));
                if (result.token) {
                    localStorage.setItem('token', result.token);
                }
                return { success: true, user: result.user };
            } else {
                return { success: false, message: result.message || 'Registrasi gagal.' };
            }

        } catch (error) {
            console.error('Register Error:', error);
            return { success: false, message: 'Gagal terhubung ke server.' };
        }
    },

    // LOGOUT
    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    },

    // GET CURRENT USER
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    }
};
