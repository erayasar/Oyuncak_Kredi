const fs = require('fs');
const path = require('path');
const https = require('https');

const images = [
    {
        name: 'lego-police.jpg',
        url: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800'
    },
    {
        name: 'barbie-house.jpg',
        url: 'https://images.unsplash.com/photo-1598465185929-88d1c4f5a0c9?w=800'
    },
    {
        name: 'rc-car.jpg',
        url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800'
    },
    {
        name: 'teddy-bear.jpg',
        url: 'https://images.unsplash.com/photo-1559454403-b4fb0b0b2b6c?w=800'
    },
    {
        name: 'educational-tablet.jpg',
        url: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=800'
    },
    {
        name: 'monopoly.jpg',
        url: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=800'
    },
    {
        name: 'slide.jpg',
        url: 'https://images.unsplash.com/photo-1597698063932-9875a2710c2c?w=800'
    },
    {
        name: 'mini-piano.jpg',
        url: 'https://images.unsplash.com/photo-1552422535-c45813c61732?w=800'
    },
    {
        name: 'science-kit.jpg',
        url: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=800'
    },
    {
        name: 'wooden-blocks.jpg',
        url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800'
    }
];

const targetDir = path.join(__dirname, '..', 'server', 'uploads');

// uploads klasörünü oluştur
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Resimleri indir
const downloadImage = (url, filename) => {
    return new Promise((resolve, reject) => {
        const targetPath = path.join(targetDir, filename);
        const file = fs.createWriteStream(targetPath);

        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(targetPath, () => {
                console.error(`Error downloading ${filename}:`, err.message);
                reject(err);
            });
        });
    });
};

// Tüm resimleri sırayla indir
async function downloadAllImages() {
    for (const image of images) {
        try {
            await downloadImage(image.url, image.name);
        } catch (error) {
            console.error(`Failed to download ${image.name}`);
        }
    }
    console.log('All images downloaded successfully!');
}

downloadAllImages(); 