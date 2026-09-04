/**
 * Client-Side Image Compression & Resizing Utility
 * Automatically scales down high-resolution images from phones & cameras
 * to an optimal web display size (max 1200px) with high-fidelity JPEG compression (~80KB - 150KB).
 */

export const compressImageFile = (file, maxWidthOrHeight = 1200, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }

    // If SVG or non-standard image, fallback to raw read
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result);
      reader.onerror = () => reject(new Error('Failed to read SVG'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          // Only downscale if larger than target dimensions
          if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
            if (width > height) {
              height = Math.round((height * maxWidthOrHeight) / width);
              width = maxWidthOrHeight;
            } else {
              width = Math.round((width * maxWidthOrHeight) / height);
              height = maxWidthOrHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(event.target?.result);
          }

          // Anti-aliasing quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Fill white canvas background in case of transparent PNG converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Draw scaled image
          ctx.drawImage(img, 0, 0, width, height);

          // Export as optimized JPEG
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          // Graceful fallback to original DataURL if canvas fails
          resolve(event.target?.result);
        }
      };

      img.onerror = () => {
        // Fallback to raw data url if Image loader fails
        resolve(event.target?.result);
      };

      img.src = event.target?.result;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
