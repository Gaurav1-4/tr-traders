import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage and returns the download URL
 * @param {File} file - The file to upload
 * @param {string} folder - The folder to store the file in
 * @returns {Promise<string>} - The download URL
 */
export const uploadFile = async (file, folder = 'products') => {
  if (!file) return null;
  
  try {
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const storageRef = ref(storage, `${folder}/${timestamp}_${cleanName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
