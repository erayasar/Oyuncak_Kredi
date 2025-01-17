const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// Tüm kiralamaları getir
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rentals] = await req.db.execute(`
            SELECT r.*, t.name as toy_name, t.imageUrl, 
                   r.start_date as rental_date, 
                   r.end_date as return_date,
                   r.points_spent as rental_price
            FROM rentals r 
            JOIN toys t ON r.toy_id = t.id 
            ORDER BY r.start_date DESC
        `);

        const formattedRentals = rentals.map(rental => ({
            id: rental.id,
            rental_date: rental.rental_date,
            return_date: rental.return_date,
            status: rental.status,
            rental_duration: Math.ceil((new Date(rental.end_date) - new Date(rental.start_date)) / (1000 * 60 * 60 * 24)),
            rental_price: rental.rental_price,
            delivery_address: rental.delivery_address,
            phone: rental.phone,
            toy: {
                name: rental.toy_name,
                imageUrl: rental.imageUrl
            }
        }));

        res.json(formattedRentals);
    } catch (error) {
        console.error('Kiralama bilgileri getirme hatası:', error);
        res.status(500).json({ message: 'Kiralama bilgileri alınırken bir hata oluştu' });
    }
});

// Kullanıcının kiralamalarını getir
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const [rentals] = await req.db.execute(`
            SELECT 
                r.id,
                r.toy_id,
                r.user_id,
                r.start_date,
                r.end_date,
                r.rental_period,
                r.points_spent,
                r.status,
                r.delivery_address,
                r.phone,
                t.name as toy_name,
                t.imageUrl as toy_imageUrl,
                t.description as toy_description,
                t.points as toy_points,
                t.ageRange as toy_ageRange,
                c.name as category_name
            FROM rentals r 
            LEFT JOIN toys t ON r.toy_id = t.id 
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE r.user_id = ?
            ORDER BY r.start_date DESC
        `, [req.user.id]);

        const formattedRentals = rentals.map(rental => ({
            id: rental.id,
            toy: {
                id: rental.toy_id,
                name: rental.toy_name,
                imageUrl: rental.toy_imageUrl,
                description: rental.toy_description,
                points: rental.toy_points,
                ageRange: rental.toy_ageRange,
                category_name: rental.category_name
            },
            rental_date: new Date(rental.start_date).toLocaleDateString('tr-TR'),
            return_date: new Date(rental.end_date).toLocaleDateString('tr-TR'),
            rental_period: rental.rental_period,
            rental_price: rental.points_spent,
            status: rental.status,
            delivery_address: rental.delivery_address,
            phone: rental.phone,
            remaining_days: Math.ceil((new Date(rental.end_date) - new Date()) / (1000 * 60 * 60 * 24))
        }));

        console.log('Formatlanan kiralamalar:', JSON.stringify(formattedRentals, null, 2));
        res.json(formattedRentals);
    } catch (error) {
        console.error('Kiralama bilgileri getirme hatası:', error);
        res.status(500).json({ message: 'Kiralama bilgileri alınırken bir hata oluştu' });
    }
});

// Oyuncak iade et
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

        // İade işlemini gerçekleştir
        await req.db.execute(
            'UPDATE rentals SET status = "returned", end_date = NOW() WHERE id = ?',
            [rentalId]
        );

        res.json({ message: 'Oyuncak başarıyla iade edildi' });
    } catch (error) {
        console.error('İade işlemi hatası:', error);
        res.status(500).json({ message: 'İade işlemi sırasında bir hata oluştu' });
    }
});

// Oyuncak kiralama endpoint'i
router.post('/:toyId/rent', authenticateToken, async (req, res) => {
    try {
        const toyId = req.params.toyId;
        const userId = req.user.id;
        const { rental_period, delivery_address, phone } = req.body;

        // Oyuncağın mevcut olup olmadığını ve kiralanabilir durumda olduğunu kontrol et
        const [toys] = await req.db.execute(
            'SELECT * FROM toys WHERE id = ? AND is_available = true',
            [toyId]
        );

        if (toys.length === 0) {
            return res.status(404).json({ message: 'Oyuncak bulunamadı veya kiralamaya uygun değil' });
        }

        const toy = toys[0];

        // Kullanıcının yeterli puanı var mı kontrol et
        const [users] = await req.db.execute(
            'SELECT points FROM users WHERE id = ?',
            [userId]
        );

        const user = users[0];
        const totalPoints = toy.points * rental_period;

        if (user.points < totalPoints) {
            return res.status(400).json({ message: 'Yeterli puanınız bulunmamaktadır' });
        }

        // Kiralama kaydı oluştur
        const start_date = new Date();
        const end_date = new Date();
        end_date.setMonth(end_date.getMonth() + rental_period);

        await req.db.execute(
            `INSERT INTO rentals (
                toy_id, 
                user_id, 
                start_date, 
                end_date, 
                rental_period,
                points_spent,
                status,
                delivery_address,
                phone
            ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
            [
                toyId,
                userId,
                start_date,
                end_date,
                rental_period,
                totalPoints,
                delivery_address,
                phone
            ]
        );

        // Oyuncağı kiralanmış olarak işaretle
        await req.db.execute(
            'UPDATE toys SET is_available = false WHERE id = ?',
            [toyId]
        );

        // Kullanıcının puanlarını güncelle
        await req.db.execute(
            'UPDATE users SET points = points - ? WHERE id = ?',
            [totalPoints, userId]
        );

        res.json({ 
            message: 'Oyuncak başarıyla kiralandı',
            rental: {
                toy_id: toyId,
                start_date,
                end_date,
                rental_period,
                points_spent: totalPoints,
                delivery_address,
                phone
            }
        });

    } catch (error) {
        console.error('Kiralama hatası:', error);
        res.status(500).json({ 
            message: 'Kiralama işlemi sırasında bir hata oluştu',
            error: error.message 
        });
    }
});

module.exports = router; 