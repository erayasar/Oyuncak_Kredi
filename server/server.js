require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Route dosyaları
const userRoutes = require('./routes/userRoutes');
const toyRoutes = require('./routes/toyRoutes');
const rentalRoutes = require('./routes/rentalRoutes');

const app = express();

// Debug için tüm gelen istekleri logla
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(cors({
    origin: '*', // Tüm originlere izin ver
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Request timeout'u artır
app.use((req, res, next) => {
    res.setTimeout(30000); // 30 saniye
    next();
});

// Body parser limit artır
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Keep-alive header ekle
app.use((req, res, next) => {
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Keep-Alive', 'timeout=5, max=1000');
    next();
});

// Uploads klasörü kontrolü
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

// MySQL bağlantı havuzu
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    timeout: 10000,
    debug: process.env.NODE_ENV === 'development'
});

// Bağlantı havuzu hata yönetimi
pool.on('connection', (connection) => {
    console.log('Yeni DB bağlantısı oluşturuldu');
});

pool.on('error', (err) => {
    console.error('Database pool hatası:', err);
});

// Database bağlantı testi
pool.getConnection()
    .then(connection => {
        console.log('Database bağlantısı başarılı');
        // Kategorileri kontrol et
        return connection.query('SELECT * FROM categories')
            .then(([rows]) => {
                console.log('Mevcut kategoriler:', rows);
                connection.release();
            });
    })
    .catch(err => {
        console.error('Database bağlantı hatası:', err);
        process.exit(1);
    });

// Her istek için yeni bir veritabanı bağlantısı al ve serbest bırak
app.use(async (req, res, next) => {
    let connection;
    try {
        connection = await pool.getConnection();
        req.db = connection;
        
        // İstek tamamlandığında bağlantıyı serbest bırak
        res.on('finish', () => {
            if (connection) {
                connection.release();
                console.log('DB bağlantısı serbest bırakıldı');
            }
        });

        next();
    } catch (err) {
        console.error('Database bağlantı hatası:', err);
        if (connection) connection.release();
        res.status(500).json({ message: 'Veritabanı bağlantı hatası' });
    }
});

// Route'ları kullan
app.use('/api/users', userRoutes);
app.use('/api/toys', toyRoutes);
app.use('/api/rentals', rentalRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API çalışıyor!' });
});

// Hata yakalama
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    
    // Bağlantıyı serbest bırak
    if (req.db) {
        req.db.release();
    }
    
    res.status(err.status || 500).json({
        message: err.message || 'Sunucu hatası',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    console.log('404 - Route bulunamadı:', req.url);
    res.status(404).json({ message: 'Sayfa bulunamadı' });
});

// Sunucu kapatma işlemi
const gracefulShutdown = () => {
    console.log('Graceful shutdown başlatılıyor...');
    
    app.close(async () => {
        console.log('Server kapatıldı');
        
        try {
            await pool.end();
            console.log('Database bağlantıları kapatıldı');
            process.exit(0);
        } catch (err) {
            console.error('Database kapatma hatası:', err);
            process.exit(1);
        }
    });

    // Zorla kapatma için timeout
    setTimeout(() => {
        console.error('Zorla kapatılıyor');
        process.exit(1);
    }, 30000);
};

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
    console.log('API endpoints:');
    console.log('- /api/users/login');
    console.log('- /api/users/register');
    console.log('- /api/toys');
    console.log('- /api/toys/categories');
    console.log('- /api/rentals');
});

// Kapatma sinyallerini dinle
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('uncaughtException', (err) => {
    console.error('Yakalanmamış hata:', err);
    gracefulShutdown();
}); 