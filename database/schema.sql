-- Önce mevcut tabloları temizle
DROP TABLE IF EXISTS rentals;
DROP TABLE IF EXISTS toys;
DROP TABLE IF EXISTS categories;

-- Kategoriler tablosu
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Örnek kategoriler
INSERT INTO categories (name) VALUES 
    ('Eğitici Oyuncaklar'),
    ('Bebek & Yumuşak Oyuncaklar'),
    ('Araçlar & Arabalar'),
    ('Yapı & İnşaat Oyuncakları'),
    ('Sanat & El Becerileri'),
    ('Oyun Setleri'),
    ('Spor & Açık Hava'),
    ('Müzik Aletleri'),
    ('Puzzle & Yapbozlar'),
    ('Elektronik Oyuncaklar');

-- Oyuncaklar tablosunu oluştur (category artık foreign key)
CREATE TABLE toys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    points INT NOT NULL DEFAULT 100,
    description TEXT,
    imageUrl VARCHAR(255) DEFAULT 'https://raw.githubusercontent.com/Erayakg/OyuncakKrediResimler/main/default.jpg',
    category_id INT,
    ageRange VARCHAR(50) NOT NULL,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_available TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Kiralama tablosunu yeniden oluştur
CREATE TABLE rentals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    toy_id INT NOT NULL,
    user_id INT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    rental_period ENUM('1', '2', '3') NOT NULL,
    points_spent INT NOT NULL,
    status ENUM('active', 'returned', 'cancelled') DEFAULT 'active',
    delivery_address VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (toy_id) REFERENCES toys(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
); 