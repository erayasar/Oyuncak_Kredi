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
    category INT,
    ageRange VARCHAR(50) NOT NULL,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category) REFERENCES categories(id)
);

-- Oyuncaklar tablosu güncelleme
ALTER TABLE toys 
ADD COLUMN points INT NOT NULL DEFAULT 100,
ADD COLUMN is_available TINYINT(1) NOT NULL DEFAULT 1;

-- Mevcut oyuncakların puanlarını güncelle (örnek olarak fiyatın %10'u kadar)
UPDATE toys SET points = CEIL(price * 0.1);

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

-- Kiralama tablosu
DROP TABLE IF EXISTS rentals;

CREATE TABLE rentals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    toy_id INT NOT NULL,
    user_id INT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    rental_period ENUM('1', '2', '3') NOT NULL, -- 1: 1 ay, 2: 2 ay, 3: 3 ay
    points_spent INT NOT NULL,
    status ENUM('active', 'returned', 'cancelled') DEFAULT 'active',
    delivery_address VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (toy_id) REFERENCES toys(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
); 

-- Önce toys tablosundaki foreign key'i sil
ALTER TABLE toys DROP FOREIGN KEY toys_ibfk_2;
ALTER TABLE toys DROP FOREIGN KEY fk_category;
ALTER TABLE toys DROP FOREIGN KEY toys_category_fk;

-- Şimdi categories tablosunu silebiliriz
DROP TABLE IF EXISTS categories;

-- Kategoriler tablosunu oluştur
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kategorileri ekle
INSERT INTO categories (id, name) VALUES 
(1, 'Peluş Oyuncaklar'),
(2, 'Eğitici Oyuncaklar'),
(3, 'Elektronik Oyuncaklar'),
(4, 'LEGO & Yapı Oyuncakları'),
(5, 'Bebek & Aksesuar'),
(6, 'Araçlar & Arabalar'),
(7, 'Kutu Oyunları'),
(8, 'Dış Mekan Oyuncakları'),
(9, 'Sanat & El İşi'),
(10, 'Müzik Aletleri');

-- Toys tablosundaki category alanını güncelle
ALTER TABLE toys MODIFY COLUMN category INT;
ALTER TABLE toys ADD CONSTRAINT toys_category_fk FOREIGN KEY (category) REFERENCES categories(id);

-- Mevcut oyuncakların kategorilerini güncelle
UPDATE toys SET category = 4 WHERE category LIKE '%LEGO%';
UPDATE toys SET category = 5 WHERE category LIKE '%Bebek%';
UPDATE toys SET category = 3 WHERE category LIKE '%Elektronik%';
UPDATE toys SET category = 6 WHERE category LIKE '%Araçlar%';
UPDATE toys SET category = 7 WHERE category LIKE '%Kutu%';
UPDATE toys SET category = 1 WHERE category LIKE '%Peluş%'; 