const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Create uploads directory if missing
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/profiles');
const THUMBNAIL_DIR = path.join(__dirname, '../../public/uploads/thumbnails');

(async () => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(THUMBNAIL_DIR, { recursive: true });
})();

const optimizeImage = async (inputPath, userId) => {
  const timestamp = Date.now();
  const safeFilename = `profile_${userId}_${timestamp}.webp`;
  const outputPath = path.join(UPLOAD_DIR, safeFilename);
  const thumbPath = path.join(THUMBNAIL_DIR, `thumb_${safeFilename}`);

  try {
    // Optimize main image (max 800x800, 80% quality)
    await sharp(inputPath)
      .resize(800, 800, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Create thumbnail (150x150)
    await sharp(inputPath)
      .resize(150, 150, { 
        fit: 'cover',
        position: 'center' 
      })
      .webp({ quality: 75 })
      .toFile(thumbPath);

    // Clean up original upload
    await fs.unlink(inputPath);

    return {
      originalUrl: `/uploads/profiles/${safeFilename}`,
      thumbnailUrl: `/uploads/thumbnails/thumb_${safeFilename}`
    };
  } catch (error) {
    console.error('Image optimization failed:', error);
    throw new Error('Failed to process image');
  }
};

// Cleanup old images
const cleanupOldImages = async (currentImagePath) => {
  if (!currentImagePath) return;
  
  try {
    const fullPath = path.join(__dirname, '../../public', currentImagePath);
    await fs.unlink(fullPath).catch(() => {});
    
    // Also remove thumbnail if exists
    if (currentImagePath.includes('profiles/')) {
      const thumbName = currentImagePath.replace('profiles/', 'thumbnails/thumb_');
      const thumbPath = path.join(__dirname, '../../public', thumbName);
      await fs.unlink(thumbPath).catch(() => {});
    }
  } catch (err) {
    console.warn('Cleanup warning:', err.message);
  }
};

module.exports = { optimizeImage, cleanupOldImages, UPLOAD_DIR };