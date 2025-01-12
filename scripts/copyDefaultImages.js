const fs = require('fs');
const path = require('path');

const defaultImages = [
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

const sourceDir = path.join(__dirname, '..', 'assets', 'default-toys');
const targetDir = path.join(__dirname, '..', 'server', 'uploads');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

defaultImages.forEach(image => {
    const sourcePath = path.join(sourceDir, image);
    const targetPath = path.join(targetDir, image);
    
    try {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied: ${image}`);
    } catch (error) {
        console.error(`Error copying ${image}:`, error);
    }
}); 