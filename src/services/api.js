const API_URL = import.meta.env.VITE_API_URL || 'https://respira-backend-production.up.railway.app/api';

export const api = {
    // --- AUTH ---
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();
            if (result.success) localStorage.setItem('user', JSON.stringify(result.user));
            return result;
        } catch (error) {
            return { success: false, message: 'Connection Error' };
        }
    },

    register: async (userData) => {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const result = await response.json();
            if (result.success) localStorage.setItem('user', JSON.stringify(result.user));
            return result;
        } catch (error) {
            return { success: false, message: 'Connection Error' };
        }
    },

    logout: () => {
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // --- HISTORY & DIAGNOSIS ---
    getHistory: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/history/${userId}`);
            return await response.json();
        } catch (error) {
            return { success: false, data: [] };
        }
    },

    getAllDiagnosisHistory: async () => {
        try {
            const response = await fetch(`${API_URL}/admin/history/all`);
            return await response.json();
        } catch (error) {
            return { success: false, data: [] };
        }
    },

    saveDiagnosis: async (data) => {
        try {
            const response = await fetch(`${API_URL}/diagnosis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            return { success: false };
        }
    },

    // --- SCORE & CHECKIN ---
    getScore: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/score/${userId}`);
            return await response.json();
        } catch (error) {
            return { success: false, score: null };
        }
    },

    saveScore: async (userId, score) => {
        try {
            const response = await fetch(`${API_URL}/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, score })
            });
            return await response.json();
        } catch (error) {
            return { success: false };
        }
    },

    checkTodayStatus: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/checkin/today/${userId}`);
            return await response.json();
        } catch (error) {
            return { success: false, hasCheckedIn: false };
        }
    },

    // --- AQI ---
    getAQI: async (lat, lon) => {
        try {
            const response = await fetch(`${API_URL}/aqi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lon })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Connection Error' };
        }
    },

    // --- NEWS ---
    getNews: async () => {
        try {
            const response = await fetch(`${API_URL}/news`, { method: 'POST' });
            return await response.json();
        } catch (error) {
            return { success: false, data: [] };
        }
    },

    // --- PROFILE ---
    getProfile: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/user/profile/${userId}`);
            return await response.json();
        } catch (error) {
            return { success: false };
        }
    },

    updateProfile: async (userId, data) => {
        try {
            const response = await fetch(`${API_URL}/user/profile/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            return { success: false };
        }
    },

    // --- TELEMEDICINE (CHAT) ---
    getContacts: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/contacts/${userId}`);
            return await response.json();
        } catch (error) {
            return { success: false, data: [] };
        }
    },

    getMessages: async (userId, contactId) => {
        try {
            const response = await fetch(`${API_URL}/messages/${userId}/${contactId}`);
            return await response.json();
        } catch (error) {
            return { success: false, data: [] };
        }
    },

    getUnreadMessages: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/messages/unread/${userId}`);
            return await response.json();
        } catch (error) {
            return { success: false, count: 0 };
        }
    },

    markMessagesRead: async (userId, senderId) => {
        try {
            const response = await fetch(`${API_URL}/messages/mark-read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, senderId })
            });
            return await response.json();
        } catch (error) {
            return { success: false };
        }
    },

    sendMessage: async (senderId, receiverId, content) => {
        try {
            const response = await fetch(`${API_URL}/messages/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senderId, receiverId, content })
            });
            return await response.json();
        } catch (error) {
            return { success: false };
        }
    },

    // --- TELEMEDICINE (APPOINTMENTS) ---
    checkQuota: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/consultations/check-quota/${userId}`);
            return await response.json();
        } catch (error) {
            return { success: false, requiresPayment: false };
        }
    },

    bookConsultation: async (data) => {
        try {
            const response = await fetch(`${API_URL}/consultations/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            return { success: false };
        }
    },

    getDoctors: async () => {
        try {
            const response = await fetch(`${API_URL}/doctors`);
            return await response.json();
        } catch (error) {
            return { success: false, data: [] };
        }
    },

    getExpertAppointments: async (doctorId) => {
        try {
            const response = await fetch(`${API_URL}/expert/appointments/${doctorId}`);
            return await response.json();
        } catch (error) {
            return { success: false, data: [] };
        }
    },

    getPatientAppointments: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/patient/appointments/${userId}`);
            return await response.json();
        } catch (error) {
            return { success: false, data: [] };
        }
    },

    respondAppointment: async (id, status, responseText) => {
        try {
            const response = await fetch(`${API_URL}/expert/appointments/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, response: responseText })
            });
            return await response.json();
        } catch (error) {
            return { success: false };
        }
    },

    cancelAppointment: async (id) => {
        try {
            const response = await fetch(`${API_URL}/consultations/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Failed to cancel appointment' };
        }
    },

    // --- ADMIN: USER MANAGEMENT ---
    getAdminUsers: async (params = {}) => {
        try {
            const query = new URLSearchParams(params).toString();
            const response = await fetch(`${API_URL}/admin/users?${query}`);
            return await response.json();
        } catch (error) {
            return { success: false, data: [] };
        }
    },

    getSubscriptionStats: async () => {
        try {
            const response = await fetch(`${API_URL}/admin/subscription-stats`);
            return await response.json();
        } catch (error) {
            return { success: false, data: {} };
        }
    },

    toggleUserPremium: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/admin/user/${userId}/toggle-premium`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Failed to toggle premium' };
        }
    },

    upgradeUser: async () => {
        try {
            const response = await fetch(`${API_URL}/user/upgrade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (error) {
            return { success: false };
        }
    },

    // --- RESEARCH APPROVALS ---
    submitResearchDraft: async (content, sourceJournal) => {
        try {
            const response = await fetch(`${API_URL}/expert/research/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ content, source_journal: sourceJournal })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Gagal menghubungi server.' };
        }
    },

    getResearchDrafts: async (userId, role) => {
        try {
            const query = new URLSearchParams({ userId, role }).toString();
            const response = await fetch(`${API_URL}/expert/research/drafts?${query}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (error) {
            return { success: false, drafts: [] };
        }
    },

    reviewResearchDraft: async (draftId, action) => {
        try {
            const response = await fetch(`${API_URL}/admin/research/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ draftId, action })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Gagal memproses usulan riset.' };
        }
    }
};
