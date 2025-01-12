const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'app', 'assets', 'toys');
const targetDir = path.join(__dirname, '..', 'server', 'uploads');

// uploads klasörünü oluştur (yoksa)
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Resimleri kopyala
const images = [
    'lego-police.jpg',
    'barbie-house.jpg',
    'rc-car.jpg',
    'teddy-bear.jpg',
    'educational-tablet.jpg',
    'monopoly.jpg',
    'slide.jpg',
    'mini-piano.jpg',
    'science-kit.jpg',
    'wooden-blocks.jpg'
];

images.forEach(image => {
    const sourcePath = path.join(sourceDir, image);
    const targetPath = path.join(targetDir, image);
    
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied: ${image}`);
    } else {
        console.log(`Missing: ${image}`);
    }
});

console.log('Image copy process completed!'); 