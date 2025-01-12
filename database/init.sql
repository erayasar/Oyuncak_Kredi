-- Kategoriler tablosu
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Örnek kategorileri ekle (eğer yoksa)
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

-- Oyuncaklar tablosu
CREATE TABLE IF NOT EXISTS toys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    points INT NOT NULL,
    category_id INT,
    user_id INT NOT NULL,
    ageRange VARCHAR(50),
    imageUrl TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
); 