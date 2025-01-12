import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    retry: 3,
    retryDelay: 1000,
    keepAlive: true,
    maxSockets: 25,
    maxFreeSockets: 10,
    validateStatus: function (status) {
        return status >= 200 && status < 300;
    }
});

// Yeniden deneme mekanizması
axiosInstance.interceptors.response.use(null, async (error) => {
    const { config } = error;
    if (!config || !config.retry) {
        return Promise.reject(error);
    }

    config.retryCount = config.retryCount || 0;

    if (config.retryCount >= config.retry) {
        return Promise.reject(error);
    }

    config.retryCount += 1;
    console.log(`Retry attempt ${config.retryCount} for ${config.url}`);

    const backoffDelay = config.retryDelay * Math.pow(2, config.retryCount - 1);
    await new Promise(resolve => setTimeout(resolve, backoffDelay));

    return axiosInstance(config);
});

// Request interceptor - her istekte token ekle
axiosInstance.interceptors.request.use(
    async (config) => {
        config.metadata = { startTime: new Date() };
        
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

// Response interceptor - hata yönetimi
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config } = error;
        
        // Retry logic
        if (!config || !config.retry) {
            return Promise.reject(error);
        }

        config.retryCount = config.retryCount || 0;

        if (config.retryCount >= config.retry) {
            return Promise.reject(error);
        }

        config.retryCount += 1;
        console.log(`Retry attempt ${config.retryCount} for ${config.url}`);

        // Exponential backoff
        const backoffDelay = config.retryDelay * Math.pow(2, config.retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));

        return axiosInstance(config);
    }
);

const api = {
    login: async (email, password) => {
        try {
            console.log('Login isteği:', { email, password });
            const response = await axiosInstance.post('/users/login', {
                email,
                password
            });
            console.log('Login yanıtı:', response.data);
            await AsyncStorage.setItem('userToken', response.data.token);
            return response.data;
        } catch (error) {
            console.error('Login hatası:', error.response?.data || error.message);
            throw error.response?.data || error;
        }
    },

    getUserToys: async () => {
        try {
            const response = await axiosInstance.get('/toys/my');
            console.log('Kullanıcı oyuncakları response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Oyuncakları getirme hatası:', error.response?.data || error.message);
            throw error;
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
            console.log('Oyuncaklar başarıyla alındı:', response.data);
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
            console.log('Kategoriler başarıyla alındı:', response.data);
            return response.data;
        } catch (error) {
            console.error('Kategorileri getirme hatası:', error.response?.data || error.message);
            throw error;
        }
    },

    updateUserProfile: async (userData) => {
        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getToken()}`
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Profil güncellenirken bir hata oluştu');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    updateToy: async (toyId, toyData) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/toys/${toyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(toyData)
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('JSON parse error:', text);
                throw new Error('Sunucu yanıtı geçersiz');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Oyuncak güncellenirken bir hata oluştu');
            }

            return data;
        } catch (error) {
            console.error('Oyuncak güncelleme hatası:', error);
            throw error;
        }
    }
};

export default api; 