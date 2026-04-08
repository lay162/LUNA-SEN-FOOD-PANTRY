/** ~1.2MB max so localStorage stays usable (demo). Production: upload to Storage. */
export const MAX_RECEIPT_BYTES = 1.2 * 1024 * 1024;

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file (photo or screenshot).'));
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      reject(new Error('Image is too large. Use a screenshot under about 1MB, or compress the photo.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}
