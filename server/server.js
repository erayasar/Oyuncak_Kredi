require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// Route dosyaları
const userRoutes = require('./routes/userRoutes');
const toyRoutes = require('./routes/toyRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MySQL bağlantısı
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('Veritabanı bağlantı hatası:', err);
        return;
    }
    console.log('MySQL veritabanına başarıyla bağlanıldı');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/toys', toyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
}); 