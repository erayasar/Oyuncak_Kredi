-- Eğer tablo varsa sil
DROP TABLE IF EXISTS categories;

-- Kategori tablosunu oluştur
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Örnek kategoriler ekle
INSERT INTO categories (name) VALUES 
    ('Bebek'),
    ('Araba'),
    ('Yapboz'),
    ('Lego'),
    ('Peluş'),
    ('Eğitici'),
    ('Outdoor'),
    ('Masa Oyunu'),
    ('Elektronik'),
    ('Diğer'); 