-- Önce tabloları temizle
DELETE FROM rentals;
DELETE FROM toys;
DELETE FROM users;

-- Örnek kullanıcı ekle
INSERT INTO users (id, username, email, password, fullName, points) VALUES 
(1, 'admin', 'admin@example.com', '$2b$10$YourHashedPasswordHere', 'Admin User', 1000);

-- Kategorileri kontrol et ve gerekirse ekle
INSERT IGNORE INTO categories (id, name) VALUES 
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

-- Örnek oyuncaklar ekleme
INSERT INTO toys (name, points, description, category_id, ageRange, user_id, imageUrl, is_available) VALUES 
(
    'LEGO City Polis Merkezi',
    300,
    'LEGO City serisi polis merkezi seti. 3 katlı bina ve polis araçları içerir. Çocukların hayal gücünü geliştirir.',
    4,
    '6-12',
    1,
    'http://localhost:3000/uploads/lego-police.jpg',
    1
),
(
    'Barbie Rüya Evi',
    250,
    'Barbie için 3 katlı modern ev. Mobilyalar ve aksesuarlar dahil. Çocukların sosyal becerilerini geliştirir.',
    5,
    '3-6',
    1,
    'http://localhost:3000/uploads/barbie-house.jpg',
    1
),
(
    'Uzaktan Kumandalı Araba',
    150,
    'Off-road özellikli uzaktan kumandalı araba. Şarj edilebilir pil ile çalışır. Dayanıklı ve hızlı.',
    6,
    '6-12',
    1,
    'http://localhost:3000/uploads/rc-car.jpg',
    1
),
(
    'Peluş Ayıcık',
    100,
    'Yumuşak ve sevimli peluş ayı. 50cm boyunda, anti-alerjik malzemeden üretilmiştir.',
    1,
    '0-3',
    1,
    'http://localhost:3000/uploads/teddy-bear.jpg',
    1
),
(
    'Eğitici Tablet',
    200,
    'Çocuklar için özel tasarlanmış eğitici tablet. Matematik, İngilizce ve genel kültür oyunları içerir.',
    2,
    '3-6',
    1,
    'http://localhost:3000/uploads/educational-tablet.jpg',
    1
),
(
    'Monopoly Klasik',
    120,
    'Klasik Monopoly emlak ticaret oyunu. Aile ile keyifli vakit geçirmek için ideal.',
    7,
    '6-12',
    1,
    'http://localhost:3000/uploads/monopoly.jpg',
    1
),
(
    'Bahçe Kaydırağı',
    400,
    'Renkli ve sağlam plastikten üretilmiş çocuk kaydırağı. UV korumalı, güvenli ve dayanıklı.',
    8,
    '3-6',
    1,
    'http://localhost:3000/uploads/slide.jpg',
    1
),
(
    'Mini Piyano',
    180,
    'Çocuklar için özel tasarlanmış mini piyano. 8 tuşlu, renkli ve eğlenceli.',
    10,
    '3-6',
    1,
    'http://localhost:3000/uploads/mini-piano.jpg',
    1
),
(
    'Bilim Seti',
    220,
    'Çocuklar için temel bilim deneyleri seti. Güvenli malzemeler ve detaylı rehber kitapçık içerir.',
    2,
    '6-12',
    1,
    'http://localhost:3000/uploads/science-kit.jpg',
    1
),
(
    'Ahşap Bloklar',
    150,
    '50 parçalı ahşap blok seti. Doğal malzemeden üretilmiş, çocukların yaratıcılığını geliştirir.',
    4,
    '0-3',
    1,
    'http://localhost:3000/uploads/wooden-blocks.jpg',
    1
); 