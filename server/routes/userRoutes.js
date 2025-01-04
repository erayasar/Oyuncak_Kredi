const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Veritabanı bağlantı havuzu
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Geçersiz email veya şifre' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Geçersiz email veya şifre' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

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

        // Email kontrolü
        const [existingUsers] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Yeni kullanıcı oluşturma
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
        );

        const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET);
        res.status(201).json({ token });
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(400).json({ message: 'Kayıt işlemi başarısız!' });
    }
});

// Kullanıcı profil bilgilerini getir
router.get('/profile', async (req, res) => {
    try {
        const userId = req.user.id; // JWT'den gelen kullanıcı ID'si
        const [users] = await pool.execute(
            'SELECT id, username, email, fullName, phone, address, points FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Kullanıcının eklediği oyuncakları getir
router.get('/toys', async (req, res) => {
    try {
        const userId = req.user.id;
        const [toys] = await pool.execute(
            'SELECT * FROM toys WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json(toys);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 