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
            SELECT r.*, t.name as toy_name, t.imageUrl,
                   r.start_date as rental_date, 
                   r.end_date as return_date,
                   r.points_spent as rental_price
            FROM rentals r 
            JOIN toys t ON r.toy_id = t.id 
            WHERE r.user_id = ?
            ORDER BY r.start_date DESC
        `, [req.user.id]);

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

module.exports = router; 