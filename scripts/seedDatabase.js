const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Kullanıcı ekle
        const [userResult] = await connection.execute(
            'INSERT INTO users (username, email, password, isAdmin, points) VALUES (?, ?, ?, ?, ?)',
            ['eray', 'eray@example.com', hashedPassword, true, 100]
        );

        const userId = userResult.insertId;

        // Oyuncakları ekle
        const toys = [
            ['Lego Classic', 299.99, 'Klasik Lego seti, yaratıcılığı geliştiren 500 parça', 'https://example.com/lego.jpg', 'Yapı Oyuncakları', '4-99', userId],
            ['Barbie Bebek', 199.99, 'Fashionista serisi Barbie bebek', 'https://example.com/barbie.jpg', 'Bebekler', '3-10', userId],
            ['Nerf Tabanca', 249.99, 'Nerf Elite serisi köpük atan tabanca', 'https://example.com/nerf.jpg', 'Aksiyon Oyuncakları', '6-12', userId],
            ['Puzzle 1000 Parça', 129.99, 'Manzara temalı 1000 parçalı puzzle', 'https://example.com/puzzle.jpg', 'Puzzle', '8-99', userId],
            ['Oyuncak Araba', 179.99, 'Uzaktan kumandalı spor araba', 'https://example.com/car.jpg', 'Arabalar', '5-12', userId]
        ];

        for (const toy of toys) {
            await connection.execute(
                'INSERT INTO toys (name, price, description, imageUrl, category, ageRange, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                toy
            );
        }

        console.log('Veriler başarıyla eklendi!');
        await connection.end();

    } catch (error) {
        console.error('Hata:', error);
    }
}

seedDatabase(); 