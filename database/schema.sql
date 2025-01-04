-- Veritabanını oluştur
CREATE DATABASE IF NOT EXISTS toystore;
USE toystore;

-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    fullName VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mevcut veritabanını kontrol et
SELECT * FROM users LIMIT 1;

-- Oyuncaklar tablosu
CREATE TABLE toys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    imageUrl VARCHAR(255) NOT NULL DEFAULT 'https://raw.githubusercontent.com/Erayakg/OyuncakKrediResimler/main/default.jpg',
    category VARCHAR(100) NOT NULL,
    ageRange VARCHAR(50) NOT NULL,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Örnek kullanıcı ekleme
INSERT INTO users (username, email, password, fullName, phone, address, points) 
VALUES ('demo_user', 'demo@example.com', '123456', 'Demo Kullanıcı', '5551234567', 'İstanbul, Türkiye', 100);

-- Örnek oyuncaklar ekleme
INSERT INTO toys (name, price, description, category, ageRange, user_id, imageUrl) VALUES
('LEGO City Polis Merkezi', 599.99, 'LEGO City serisi polis merkezi seti. 3 katlı bina ve polis araçları içerir.', 'LEGO', '6-12', 1, 'https://example.com/lego-police.jpg'),

('Barbie Rüya Evi', 799.99, 'Barbie için 3 katlı modern ev. Mobilyalar ve aksesuarlar dahil.', 'Bebek', '3-8', 1, 'https://example.com/barbie-house.jpg'),

('Nerf Ultra One', 299.99, 'Yüksek performanslı Nerf tabancası. 25 dart kapasiteli.', 'Oyuncak Silah', '8+', 1, 'https://example.com/nerf.jpg'),

('Hot Wheels 10lu Set', 149.99, 'Koleksiyon değeri olan 10 adet Hot Wheels araba seti.', 'Araba', '3+', 1, 'https://example.com/hotwheels.jpg'),

('Monopoly Klasik', 249.99, 'Klasik Monopoly emlak ticaret oyunu.', 'Kutu Oyunu', '8+', 1, 'https://example.com/monopoly.jpg'),

('Peluş Ayı', 199.99, 'Büyük boy, yumuşak peluş ayı. 1 metre boyunda.', 'Peluş', '0+', 1, 'https://example.com/teddy.jpg'),

('Puzzle 1000 Parça', 129.99, 'İstanbul manzaralı 1000 parça puzzle.', 'Puzzle', '12+', 1, 'https://example.com/puzzle.jpg'),

('Uzaktan Kumandalı Araba', 399.99, 'Off-road özellikli uzaktan kumandalı araba. Şarj edilebilir.', 'RC Oyuncak', '8+', 1, 'https://example.com/rc-car.jpg'); 