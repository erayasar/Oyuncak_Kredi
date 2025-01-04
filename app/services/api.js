import axios from 'axios';

// iOS için doğru URL
const API_URL = 'http://localhost:3000/api';

const api = {
    login: async (email, password) => {
        try {
            console.log('API isteği gönderiliyor:', { email, password });
            const response = await axios.post(`${API_URL}/users/login`, {
                email,
                password
            });
            console.log('API yanıtı:', response.data);
            return response.data;
        } catch (error) {
            console.error('API hatası:', error.response?.data || error.message);
            throw error.response?.data || error;
        }
    },

    getToys: async () => {
        try {
            const response = await axios.get(`${API_URL}/toys`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },

    register: async ({ username, email, password }) => {
        try {
            const response = await axios.post(`${API_URL}/users/register`, {
                username,
                email,
                password
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    addToy: async (toyData) => {
        try {
            console.log('Oyuncak ekleme isteği:', toyData);
            const response = await axios.post(`${API_URL}/toys`, toyData);
            console.log('Oyuncak ekleme yanıtı:', response.data);
            return response.data;
        } catch (error) {
            console.error('Oyuncak ekleme hatası:', error.response?.data || error.message);
            throw error.response?.data || error;
        }
    },

    getUserInfo: async () => {
        try {
            const response = await axios.get(`${API_URL}/users/profile`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getUserToys: async () => {
        try {
            const response = await axios.get(`${API_URL}/users/toys`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default api; 