const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth');
require('dotenv').config();
const bcrypt = require('bcrypt');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login isteği geldi:', { email, password });

        // Önce email kontrolü
        const [users] = await req.db.execute(
            'SELECT id, username, email, password, fullName, phone, address, points FROM users WHERE email = ?', 
            [email]
        );
        
        if (users.length === 0) {
            console.log('Email bulunamadı:', email);
            return res.status(401).json({ 
                message: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı',
                error: 'EMAIL_NOT_FOUND'
            });
        }

        const user = users[0];
        console.log('Veritabanından gelen kullanıcı:', {
            ...user,
            password: '***'
        });
        
        // Şifre kontrolü
        if (password !== user.password) {
            console.log('Şifre yanlış');
            return res.status(401).json({ 
                message: 'Şifre yanlış',
                error: 'INVALID_PASSWORD'
            });
        }

        console.log('Giriş başarılı, token oluşturuluyor...');
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        
        console.log('Token oluşturuldu, yanıt gönderiliyor...');
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                address: user.address,
                points: user.points
            } 
        });
    } catch (error) {
        console.error('Login hatası:', error);
        res.status(500).json({ message: error.message });
    }
});

// Register route
router.post('/register', async (req, res) => {
    const pool = req.db;
    try {
        const { username, email, password, fullName, phone, address } = req.body;
        console.log('Gelen kayıt bilgileri:', { 
            username, 
            email, 
            password: '***', 
            fullName, 
            phone, 
            address 
        });

        // Validasyonlar
        if (!username || username.length < 3) {
            return res.status(400).json({ message: 'Kullanıcı adı en az 3 karakter olmalıdır!' });
        }

        if (!email || !email.includes('@') || !email.includes('.')) {
            return res.status(400).json({ message: 'Geçerli bir email adresi giriniz!' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır!' });
        }

        if (!fullName || !phone || !address) {
            return res.status(400).json({ message: 'Lütfen tüm kişisel bilgileri doldurun!' });
        }

        // Email kontrolü
        const [existingUsers] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Bu email adresi zaten kullanımda' });
        }

        // Kullanıcıyı kaydet
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password, fullName, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, password, fullName, phone, address]
        );

        // Yeni kullanıcı bilgilerini al
        const [newUsers] = await pool.execute(
            'SELECT id, username, email, fullName, phone, address, points FROM users WHERE id = ?',
            [result.insertId]
        );

        const newUser = newUsers[0];
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET);

        console.log('Kayıt başarılı. Kullanıcı:', newUser);

        res.status(201).json({
            token,
            user: newUser
        });
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(400).json({ message: 'Kayıt işlemi başarısız: ' + error.message });
    }
});

// Kullanıcı profil bilgilerini getir
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await req.db.execute(
            'SELECT id, username, email, fullName, phone, address, points FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        console.log('Kullanıcı profili:', users[0]); // Debug log
        res.json(users[0]);
    } catch (error) {
        console.error('Profil getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Profil bilgilerini güncelle
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, phone, address, currentPassword, newPassword } = req.body;

        console.log('Gelen güncelleme verileri:', {
            userId,
            fullName,
            phone,
            address,
            hasCurrentPassword: !!currentPassword,
            hasNewPassword: !!newPassword
        });

        // Önce mevcut kullanıcı bilgilerini al
        const [users] = await req.db.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        const currentUser = users[0];

        // Şifre değişikliği isteği varsa
        if (currentPassword && newPassword) {
            // Mevcut şifre kontrolü
            if (currentPassword !== currentUser.password) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Mevcut şifreniz yanlış'
                });
            }

            // Şifreyi güncelle
            await req.db.execute(
                'UPDATE users SET password = ? WHERE id = ?',
                [newPassword, userId]
            );
        }

        // Profil bilgilerini güncelle (undefined değerleri mevcut değerlerle değiştir)
        await req.db.execute(
            'UPDATE users SET fullName = ?, phone = ?, address = ? WHERE id = ?',
            [
                fullName || currentUser.fullName,
                phone || currentUser.phone,
                address || currentUser.address,
                userId
            ]
        );

        // Güncellenmiş kullanıcı bilgilerini al
        const [updatedUser] = await req.db.execute(
            'SELECT id, username, email, fullName, phone, address FROM users WHERE id = ?',
            [userId]
        );

        res.json({
            status: 'success',
            message: currentPassword && newPassword ? 
                'Profil bilgileri ve şifre başarıyla güncellendi' : 
                'Profil bilgileri başarıyla güncellendi',
            user: updatedUser[0]
        });

    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        res.status(500).json({
            status: 'error',
            message: 'Profil güncellenirken bir hata oluştu'
        });
    }
});

// Kullanıcının eklediği oyuncakları getir
router.get('/toys', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Kullanıcı ID:', userId);
        
        const [toys] = await req.db.execute(
            'SELECT * FROM toys WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        
        console.log('Kullanıcının oyuncakları:', toys);
        res.json(toys);
    } catch (error) {
        console.error('Oyuncakları getirme hatası:', error);
        res.status(500).json({ message: error.message });
    }
});

// Şifre değiştirme endpoint'i
router.post('/profile/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Mevcut şifreyi kontrol et
        const [users] = await req.db.execute(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        const user = users[0];
        
        // Şimdilik plain text karşılaştırma yapıyoruz
        if (currentPassword !== user.password) {
            return res.status(400).json({ message: 'Mevcut şifre yanlış' });
        }

        // Şifreyi güncelle
        await req.db.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [newPassword, userId]
        );

        res.json({ message: 'Şifre başarıyla güncellendi' });
    } catch (error) {
        console.error('Şifre değiştirme hatası:', error);
        res.status(500).json({ 
            message: 'Şifre değiştirme işlemi başarısız oldu',
            error: error.message 
        });
    }
});

module.exports = router; 