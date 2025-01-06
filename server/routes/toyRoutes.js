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
        const { name, price, description, category, ageRange, imageUrl, points } = req.body;
        const userId = req.user.id;

        console.log('Token kullanıcı bilgileri:', req.user);
        console.log('Eklenen oyuncak bilgileri:', {
            name,
            price,
            description,
            category,
            ageRange,
            userId,
            imageUrl,
            points: points || Math.ceil(price * 0.1), // Eğer points belirtilmemişse fiyatın %10'unu al
            is_available: 1
        });

        // Oyuncağı kaydet
        const [result] = await req.db.execute(
            'INSERT INTO toys (name, price, description, category, ageRange, user_id, imageUrl, points, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                name, 
                price, 
                description, 
                category, 
                ageRange, 
                userId, 
                imageUrl, 
                points || Math.ceil(price * 0.1),
                1
            ]
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
        const [toys] = await req.db.execute(`
            SELECT t.*, c.name as category_name 
            FROM toys t 
            LEFT JOIN categories c ON t.category = c.id 
            ORDER BY t.created_at DESC
        `);
        console.log('Gönderilen oyuncaklar:', toys);
        res.json(toys);
    } catch (error) {
        console.error('Oyuncakları getirme hatası:', error);
        res.status(500).json({ message: error.message });
    }
});

// Oyuncak kiralama endpoint'i
router.post('/rent/:toyId', authenticateToken, async (req, res) => {
    try {
        const toyId = req.params.toyId;
        const userId = req.user.id;
        const { rentalPeriod, deliveryAddress, phone } = req.body;

        console.log('Kiralama isteği:', {
            toyId,
            userId,
            rentalPeriod,
            deliveryAddress,
            phone
        });

        // Oyuncağın mevcut ve kiralanabilir olup olmadığını kontrol et
        const [toys] = await req.db.execute(
            'SELECT * FROM toys WHERE id = ? AND is_available = 1',
            [toyId]
        );

        if (toys.length === 0) {
            return res.status(404).json({ message: 'Oyuncak bulunamadı veya kiralanamaz durumda' });
        }

        const toy = toys[0];

        // Kiralama puanını hesapla
        const pointsRequired = toy.points * parseInt(rentalPeriod);

        console.log('Puan hesaplaması:', {
            toyPoints: toy.points,
            rentalPeriod,
            pointsRequired
        });

        // Kullanıcının puanlarını kontrol et
        const [users] = await req.db.execute(
            'SELECT points FROM users WHERE id = ?',
            [userId]
        );

        if (users[0].points < pointsRequired) {
            return res.status(400).json({ 
                message: 'Yetersiz puan',
                required: pointsRequired,
                available: users[0].points
            });
        }

        // Kiralama bitiş tarihini hesapla
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + parseInt(rentalPeriod));

        // Kiralama işlemini kaydet
        await req.db.execute(
            'INSERT INTO rentals (toy_id, user_id, start_date, end_date, rental_period, points_spent, delivery_address, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [toyId, userId, startDate, endDate, rentalPeriod, pointsRequired, deliveryAddress, phone]
        );

        // Oyuncağın durumunu güncelle
        await req.db.execute(
            'UPDATE toys SET is_available = 0 WHERE id = ?',
            [toyId]
        );

        // Kullanıcının puanlarını güncelle
        await req.db.execute(
            'UPDATE users SET points = points - ? WHERE id = ?',
            [pointsRequired, userId]
        );

        console.log('Kiralama başarılı:', {
            toyId,
            userId,
            pointsSpent: pointsRequired,
            startDate,
            endDate
        });

        res.json({ 
            message: 'Oyuncak başarıyla kiralandı',
            rentalDetails: {
                toyName: toy.name,
                period: rentalPeriod,
                pointsSpent: pointsRequired,
                startDate: startDate,
                endDate: endDate
            }
        });
    } catch (error) {
        console.error('Kiralama hatası:', error);
        res.status(500).json({ 
            message: 'Kiralama işlemi başarısız oldu',
            error: error.message 
        });
    }
});

// İade işlemi için rentalRoutes.js'de güncelleme yapalım
router.post('/:rentalId/return', authenticateToken, async (req, res) => {
    try {
        const rentalId = req.params.rentalId;
        
        // Kiralamanın mevcut olup olmadığını ve kullanıcıya ait olduğunu kontrol et
        const [rentals] = await req.db.execute(
            'SELECT * FROM rentals WHERE id = ? AND user_id = ? AND status = "active"',
            [rentalId, req.user.id]
        );

        if (rentals.length === 0) {
            return res.status(404).json({ message: 'Geçerli kiralama bulunamadı' });
        }

        const rental = rentals[0];

        // İade işlemini gerçekleştir
        await req.db.execute(
            'UPDATE rentals SET status = "returned", end_date = NOW() WHERE id = ?',
            [rentalId]
        );

        // Oyuncağı tekrar kiralanabilir yap
        await req.db.execute(
            'UPDATE toys SET is_available = 1 WHERE id = ?',
            [rental.toy_id]
        );

        res.json({ message: 'Oyuncak başarıyla iade edildi' });
    } catch (error) {
        console.error('İade işlemi hatası:', error);
        res.status(500).json({ message: 'İade işlemi sırasında bir hata oluştu' });
    }
});

// Kullanıcının kendi oyuncaklarını getir
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const [toys] = await req.db.execute(
            'SELECT * FROM toys WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(toys);
    } catch (error) {
        console.error('Oyuncakları getirme hatası:', error);
        res.status(500).json({ message: 'Oyuncaklar alınırken bir hata oluştu' });
    }
});

// Oyuncak silme endpoint'i
router.delete('/:toyId', authenticateToken, async (req, res) => {
    try {
        const toyId = req.params.toyId;
        
        // Oyuncağın mevcut olup olmadığını ve kullanıcıya ait olduğunu kontrol et
        const [toys] = await req.db.execute(
            'SELECT * FROM toys WHERE id = ? AND user_id = ?',
            [toyId, req.user.id]
        );

        if (toys.length === 0) {
            return res.status(404).json({ message: 'Oyuncak bulunamadı veya size ait değil' });
        }

        // Aktif kiralama var mı kontrol et
        const [rentals] = await req.db.execute(
            'SELECT * FROM rentals WHERE toy_id = ? AND status = "active"',
            [toyId]
        );

        if (rentals.length > 0) {
            return res.status(400).json({ message: 'Bu oyuncak şu anda kiralanmış durumda, silemezsiniz' });
        }

        // Oyuncağı sil
        await req.db.execute('DELETE FROM toys WHERE id = ?', [toyId]);

        res.json({ message: 'Oyuncak başarıyla silindi' });
    } catch (error) {
        console.error('Oyuncak silme hatası:', error);
        res.status(500).json({ message: 'Oyuncak silinirken bir hata oluştu' });
    }
});

// Kategorileri getir
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await req.db.execute('SELECT * FROM categories ORDER BY name');
        console.log('Gönderilen kategoriler:', categories); // Debug için
        res.json(categories);
    } catch (error) {
        console.error('Kategorileri getirme hatası:', error);
        res.status(500).json({ message: 'Kategoriler alınırken bir hata oluştu' });
    }
});

module.exports = router; 