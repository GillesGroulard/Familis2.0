export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  isVertical: boolean,
  mimeType = 'image/jpeg'
): Promise<File | null> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Set dimensions based on orientation while maintaining aspect ratio
  const targetWidth = isVertical ? 1000 : 1600;
  const targetHeight = isVertical ? 1600 : 1000;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Fill background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Calculate scale to maintain aspect ratio
  const scale = Math.min(
    targetWidth / pixelCrop.width,
    targetHeight / pixelCrop.height
  );

  // Calculate dimensions at current scale
  const scaledWidth = pixelCrop.width * scale;
  const scaledHeight = pixelCrop.height * scale;

  // Center the image
  const x = (targetWidth - scaledWidth) / 2;
  const y = (targetHeight - scaledHeight) / 2;

  // Draw the image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    x,
    y,
    scaledWidth,
    scaledHeight
  );

  // Convert to file with high quality
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const file = new File([blob], 'cropped-image.jpg', {
          type: mimeType,
        });
        resolve(file);
      },
      mimeType,
      0.95 // High quality
    );
  });
};