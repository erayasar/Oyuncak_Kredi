import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000/api';

// Axios instance oluştur
const axiosInstance = axios.create({
    baseURL: API_URL
});

// Request interceptor ekle
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const api = {
    login: async (email, password) => {
        try {
            const response = await axiosInstance.post('/users/login', {
                email,
                password
            });
            // Token'ı kaydet
            await AsyncStorage.setItem('userToken', response.data.token);
            return response.data;
        } catch (error) {
            console.error('Login hatası:', error.response?.data || error.message);
            throw error.response?.data || error;
        }
    },

    getUserToys: async () => {
        try {
            const response = await axiosInstance.get('/users/toys');
            console.log('API yanıtı - Kullanıcı oyuncakları:', response.data);
            return response.data;
        } catch (error) {
            console.error('Oyuncakları getirme hatası:', error.response?.data || error);
            throw error.response?.data || error;
        }
    },

    getUserInfo: async () => {
        try {
            const response = await axiosInstance.get('/users/profile');
            return response.data;
        } catch (error) {
            console.error('Profil bilgileri getirme hatası:', error.response?.data || error);
            throw error.response?.data || error;
        }
    },

    updateUserInfo: async (userData) => {
        try {
            const response = await axiosInstance.put('/users/profile', userData);
            return response.data;
        } catch (error) {
            console.error('Profil güncelleme hatası:', error.response?.data || error);
            throw error.response?.data || { message: 'Profil güncellenirken bir hata oluştu' };
        }
    },

    getToys: async () => {
        try {
            const response = await axiosInstance.get('/toys');
            return response.data;
        } catch (error) {
            console.error('Oyuncakları getirme hatası:', error.response?.data || error);
            throw error.response?.data || error;
        }
    },

    addToy: async (toyData) => {
        try {
            // toyData'ya user_id eklemeye gerek yok, server tarafında token'dan alınacak
            console.log('Eklenecek oyuncak:', toyData);
            const response = await axiosInstance.post('/toys', toyData);
            console.log('Eklenen oyuncak:', response.data);
            return response.data;
        } catch (error) {
            console.error('Oyuncak ekleme hatası:', error.response?.data || error);
            throw error.response?.data || error;
        }
    },

    logout: async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            return true;
        } catch (error) {
            console.error('Çıkış yapma hatası:', error);
            throw error;
        }
    },

    rentToy: async (toyId, rentalData) => {
        try {
            const response = await axiosInstance.post(`/toys/rent/${toyId}`, rentalData);
            return response.data;
        } catch (error) {
            console.error('Kiralama hatası:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Kiralama işlemi başarısız oldu');
        }
    },

    uploadImage: async (formData) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            
            console.log('Uploading image...', formData);
            
            const response = await fetch(`${API_URL}/toys/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Content-Type header'ı formData ile otomatik ayarlanacak
                },
                body: formData
            });

            console.log('Upload response status:', response.status);
            
            const text = await response.text();
            console.log('Raw response:', text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('JSON parse error:', e);
                throw new Error('Sunucu yanıtı geçersiz');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Resim yüklenirken bir hata oluştu');
            }

            return data;
        } catch (error) {
            console.error('Resim yükleme hatası:', error);
            throw error;
        }
    },

    getRentals: async () => {
        try {
            const response = await axiosInstance.get('/rentals');
            return response.data;
        } catch (error) {
            console.error('Kiralama bilgileri getirme hatası:', error);
            throw error;
        }
    },

    getMyRentals: async () => {
        try {
            const response = await axiosInstance.get('/rentals/my');
            return response.data;
        } catch (error) {
            console.error('Kiralama bilgileri getirme hatası:', error);
            throw error;
        }
    },

    returnToy: async (rentalId) => {
        try {
            const response = await axiosInstance.post(`/rentals/${rentalId}/return`);
            return response.data;
        } catch (error) {
            console.error('Oyuncak iade hatası:', error);
            throw error;
        }
    },

    getMyToys: async () => {
        try {
            const response = await axiosInstance.get('/toys/my');
            return response.data;
        } catch (error) {
            console.error('Oyuncakları getirme hatası:', error);
            throw error;
        }
    },

    deleteToy: async (toyId) => {
        try {
            const response = await axiosInstance.delete(`/toys/${toyId}`);
            return response.data;
        } catch (error) {
            console.error('Oyuncak silme hatası:', error);
            throw error;
        }
    },

    getCategories: async () => {
        try {
            const response = await axiosInstance.get('/toys/categories');
            return response.data;
        } catch (error) {
            console.error('Kategorileri getirme hatası:', error);
            throw error;
        }
    }
};

export default api; 