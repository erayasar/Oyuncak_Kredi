require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Route dosyaları
const userRoutes = require('./routes/userRoutes');
const toyRoutes = require('./routes/toyRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Uploads klasörünü oluştur
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Statik dosya servisini düzelt
app.use('/uploads', express.static(uploadsDir));

// MySQL bağlantı havuzu oluştur
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Veritabanı bağlantı testi
pool.getConnection()
    .then(connection => {
        console.log('Veritabanı bağlantısı başarılı');
        connection.release();
    })
    .catch(err => {
        console.error('Veritabanı bağlantı hatası:', err);
    });

// Pool'u route'lara aktar
app.use((req, res, next) => {
    req.db = pool;
    next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/toys', toyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});

// Hata durumunda process'i sonlandır
process.on('unhandledRejection', (err) => {
    console.error('Yakalanmamış hata:', err);
    process.exit(1);
}); 