-- Tabloları temizle
DELETE FROM toys;
DELETE FROM users;

-- Test kullanıcısı ekle (şifre düz metin olarak)
INSERT INTO users (username, email, password, isAdmin, points) VALUES 
('eray', 'eray@test.com', '123456', true, 100);

-- Test oyuncakları ekle
INSERT INTO toys (name, price, description, imageUrl, category, ageRange, user_id) VALUES
('Lego Classic', 299.99, 'Klasik Lego seti', 'https://example.com/lego.jpg', 'Yapı Oyuncakları', '4-99', 1),
('Barbie Bebek', 199.99, 'Fashionista Barbie', 'https://example.com/barbie.jpg', 'Bebekler', '3-10', 1); 