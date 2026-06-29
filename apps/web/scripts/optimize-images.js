import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import sharp dynamically so the script compiles even if sharp isn't installed yet
let sharp;

const TARGET_DIR = path.resolve(__dirname, '../public/images');

async function init() {
  try {
    sharp = (await import('sharp')).default;
  } catch (err) {
    console.warn('⚠️  Warning: "sharp" is not available in this environment (likely CI/Vercel).');
    console.warn('   Skipping image optimization — images should already be pre-optimized locally.');
    process.exit(0); // Graceful skip — do NOT fail the build
  }
}

// Recursively get all image files
function getFilesRecursively(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    console.warn(`Warning: Directory ${dir} does not exist.`);
    return fileList;
  }

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFilesRecursively(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

async function optimize() {
  await init();
  
  console.log(`🚀 Starting WebP optimization in: ${TARGET_DIR}`);
  const images = getFilesRecursively(TARGET_DIR);
  
  if (images.length === 0) {
    console.log('No JPG/PNG images found to optimize.');
    return;
  }
  
  console.log(`Found ${images.length} images. Processing...`);
  
  let totalSavedBytes = 0;
  let processedCount = 0;

  for (const imagePath of images) {
    const ext = path.extname(imagePath);
    const webpPath = imagePath.replace(new RegExp(`${ext}$`, 'i'), '.webp');
    
    // Skip if webp exists and is newer than source image
    if (fs.existsSync(webpPath)) {
      const sourceStat = fs.statSync(imagePath);
      const webpStat = fs.statSync(webpPath);
      if (webpStat.mtimeMs > sourceStat.mtimeMs) {
        console.log(`⏭️ Skipping (already optimized): ${path.relative(TARGET_DIR, webpPath)}`);
        continue;
      }
    }

    try {
      const sourceSize = fs.statSync(imagePath).size;
      
      // Optimize to WebP using sharp with high-performance settings
      await sharp(imagePath)
        .webp({ quality: 80, effort: 6 }) // Elite-level WebP encoding quality & compression effort
        .toFile(webpPath);
        
      const optimizedSize = fs.statSync(webpPath).size;
      const saved = sourceSize - optimizedSize;
      totalSavedBytes += saved;
      processedCount++;

      const savingsPct = ((saved / sourceSize) * 100).toFixed(1);
      console.log(`✅ Optimized: ${path.relative(TARGET_DIR, imagePath)} -> .webp`);
      console.log(`   Size: ${(sourceSize / 1024).toFixed(1)} KB -> ${(optimizedSize / 1024).toFixed(1)} KB (${savingsPct}% saved)`);
    } catch (error) {
      console.error(`❌ Failed to optimize ${path.relative(TARGET_DIR, imagePath)}:`, error.message);
    }
  }

  console.log('\n--- Optimization Summary ---');
  console.log(`Total Images Processed: ${processedCount}`);
  console.log(`Total Space Saved: ${(totalSavedBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log('----------------------------');
}

optimize().catch(console.error);
