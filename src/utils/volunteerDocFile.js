/** ~1.5MB — keeps localStorage / offline queue usable until Firebase Storage is wired. */
export const MAX_VOLUNTEER_DOC_BYTES = 1.5 * 1024 * 1024;

/**
 * @param {File} file
 * @returns {Promise<{ dataUrl: string; fileName: string }>}
 */
export function readVolunteerDocument(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected.'));
      return;
    }
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf) {
      reject(new Error('Please choose a photo (JPG, PNG, etc.) or a PDF document.'));
      return;
    }
    if (file.size > MAX_VOLUNTEER_DOC_BYTES) {
      reject(
        new Error(
          'That file is too large (max about 1.5 MB). Try a clearer photo, crop the image, or compress the PDF.'
        )
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      resolve({ dataUrl: String(reader.result || ''), fileName: file.name || 'document' });
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}
