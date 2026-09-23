import { storage } from "./firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

export interface UploadedImageMetadata {
  url: string;
  path: string;
  name: string;
  size?: number;
  uploadedAt: string;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Validate image file format and size
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file format "${file.type}". Allowed formats: JPG, PNG, WebP, AVIF, GIF.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File "${file.name}" is too large (${sizeMb} MB). Maximum allowed size is 10 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Upload a single image file to Firebase Storage
 */
export async function uploadPropertyImage(
  file: File,
  folder = "properties",
  onProgress?: (progress: number) => void
): Promise<UploadedImageMetadata> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueId = Math.random().toString(36).substring(2, 9);
  const storagePath = `${folder}/${Date.now()}_${uniqueId}_${cleanName}`;

  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (onProgress && snapshot.totalBytes > 0) {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          onProgress(progress);
        }
      },
      (error) => {
        console.error("Firebase Storage Upload Error:", error);
        reject(new Error(`Failed to upload image: ${error.message}`));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadUrl,
            path: storagePath,
            name: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          });
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : "Failed to get download URL";
          reject(new Error(errMsg));
        }
      }
    );
  });
}

/**
 * Upload multiple property images
 */
export async function uploadMultiplePropertyImages(
  files: File[],
  folder = "properties",
  onOverallProgress?: (completed: number, total: number) => void
): Promise<UploadedImageMetadata[]> {
  const results: UploadedImageMetadata[] = [];
  let completed = 0;

  for (const file of files) {
    const res = await uploadPropertyImage(file, folder);
    results.push(res);
    completed += 1;
    if (onOverallProgress) {
      onOverallProgress(completed, files.length);
    }
  }

  return results;
}

/**
 * Delete an image file from Firebase Storage
 */
export async function deleteStorageImage(storagePathOrUrl: string): Promise<boolean> {
  try {
    let fileRef;
    if (storagePathOrUrl.startsWith("http")) {
      // If full download URL is passed, ref can resolve it directly
      fileRef = ref(storage, storagePathOrUrl);
    } else {
      fileRef = ref(storage, storagePathOrUrl);
    }

    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.warn("Could not delete file from Firebase Storage:", error);
    return false;
  }
}

