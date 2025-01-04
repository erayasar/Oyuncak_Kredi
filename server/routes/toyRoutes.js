const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Oyuncak ekleme endpoint'i
router.post('/', async (req, res) => {
    try {
        const { name, price, description, category, ageRange } = req.body;
        
        // Validasyon
        if (!name || !price || !description || !category || !ageRange) {
            return res.status(400).json({ 
                message: 'Lütfen tüm zorunlu alanları doldurun' 
            });
        }

        // Fiyat kontrolü
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ 
                message: 'Geçerli bir fiyat giriniz' 
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO toys (name, price, description, category, ageRange, imageUrl) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                name, 
                price, 
                description, 
                category, 
                ageRange,
                'https://via.placeholder.com/150'
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Oyuncak başarıyla eklendi',
            toyId: result.insertId
        });

    } catch (error) {
        console.error('Oyuncak ekleme hatası:', error);
        res.status(500).json({ 
            message: 'Oyuncak eklenirken bir hata oluştu' 
        });
    }
});

// Tüm oyuncakları getirme endpoint'i
router.get('/', async (req, res) => {
    try {
        const [toys] = await pool.execute(
            'SELECT * FROM toys ORDER BY created_at DESC'
        );
        res.json(toys);
    } catch (error) {
        console.error('Oyuncakları getirme hatası:', error);
        res.status(500).json({ 
            message: 'Oyuncaklar getirilirken bir hata oluştu' 
        });
    }
});

module.exports = router; 