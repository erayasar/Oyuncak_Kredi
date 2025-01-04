const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Veritabanına başarıyla bağlanıldı!');
        
        // Test sorgusu
        const [rows] = await connection.execute('SELECT 1');
        console.log('Test sorgusu başarılı!');

        // Tabloları kontrol et
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('\nMevcut tablolar:');
        tables.forEach(table => {
            console.log(`- ${Object.values(table)[0]}`);
        });

        await connection.end();
    } catch (error) {
        console.error('Bağlantı hatası:', error.message);
    }
}

testConnection(); 