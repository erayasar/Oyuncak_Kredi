const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticateToken = require('../middleware/auth');

// Resim yükleme için multer konfigürasyonu
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        // uploads klasörü yoksa oluştur
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Benzersiz dosya adı oluştur
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Sadece resim dosyalarına izin ver
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları yüklenebilir.'));
        }
    }
});

// Resim yükleme endpoint'i
router.post('/upload', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Resim yüklenemedi' });
        }

        // Tam dosya yolunu oluştur
        const fullPath = path.join(__dirname, '..', 'uploads', req.file.filename);
        
        // Dosyanın var olduğunu kontrol et
        if (!fs.existsSync(fullPath)) {
            return res.status(500).json({ message: 'Dosya kaydedilemedi' });
        }

        // Resmin URL'ini oluştur
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.json({
            status: 'success',
            message: 'Resim başarıyla yüklendi',
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error('Resim yükleme hatası:', error);
        res.status(500).json({
            status: 'error',
            message: 'Resim yüklenirken bir hata oluştu'
        });
    }
});

// Oyuncak ekleme endpoint'i
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, price, description, category, ageRange, imageUrl } = req.body;
        const userId = req.user.id; // Token'dan kullanıcı ID'sini al

        console.log('Token kullanıcı bilgileri:', req.user);
        console.log('Eklenen oyuncak bilgileri:', {
            name,
            price,
            description,
            category,
            ageRange,
            userId,
            imageUrl
        });

        // Oyuncağı kaydet
        const [result] = await req.db.execute(
            'INSERT INTO toys (name, price, description, category, ageRange, user_id, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, price, description, category, ageRange, userId, imageUrl]
        );

        // Yeni eklenen oyuncağı getir
        const [newToy] = await req.db.execute(
            'SELECT * FROM toys WHERE id = ?',
            [result.insertId]
        );

        console.log('Yeni eklenen oyuncak:', newToy[0]);
        res.status(201).json(newToy[0]);
    } catch (error) {
        console.error('Oyuncak ekleme hatası:', error);
        res.status(500).json({ message: error.message });
    }
});

// Tüm oyuncakları getirme endpoint'i
router.get('/', async (req, res) => {
    try {
        const [toys] = await req.db.execute(
            'SELECT * FROM toys ORDER BY created_at DESC'
        );
        res.json(toys);
    } catch (error) {
        console.error('Oyuncakları getirme hatası:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 