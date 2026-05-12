import { db } from '@/lib/firebase';
import type { AmazonProductData, AmazonProductDocument } from '@/types/amazon';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';

const collectionName = import.meta.env.VITE_FIREBASE_AMAZON_COLLECTION || 'amazon_products';
const amazonProductsCollectionRef = collection(db, collectionName);

export interface AmazonImageUploadResult {
  imageUrl: string;
  imageKey: string;
}

export function getAmazonProductsRealtime(
  callback: (products: AmazonProductDocument[]) => void,
  onError?: (error: unknown) => void,
) {
  const unsubscribe = onSnapshot(
    amazonProductsCollectionRef,
    (querySnapshot) => {
      const fetchedProducts: AmazonProductDocument[] = [];
      querySnapshot.forEach((snapshotDoc) => {
        fetchedProducts.push({
          id: snapshotDoc.id,
          ...(snapshotDoc.data() as AmazonProductData),
        });
      });

      const sortedProducts = fetchedProducts.sort((a, b) => a.title.localeCompare(b.title));
      callback(sortedProducts);
    },
    (error) => {
      console.error('Errore nel caricamento dei prodotti Amazon in tempo reale: ', error);
      onError?.(error);
    },
  );

  return unsubscribe;
}

export async function addAmazonProduct(data: AmazonProductData) {
  return addDoc(amazonProductsCollectionRef, {
    ...data,
    sold: data.sold ?? false,
    timestamp: new Date(),
  });
}

export async function updateAmazonProduct(id: string, data: Partial<AmazonProductData>) {
  const docRef = doc(db, collectionName, id);
  return updateDoc(docRef, data);
}

export async function deleteAmazonProduct(id: string) {
  const docRef = doc(db, collectionName, id);
  return deleteDoc(docRef);
}

const _apiBaseRaw = import.meta.env.VITE_API_BASE_URL || '';
const _apiBase = _apiBaseRaw.replace(/\/+$/g, '');

const loadImageElementFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Impossibile leggere l\'immagine selezionata'));
    };

    image.src = objectUrl;
  });
};

const canvasToWebpBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Conversione WebP non riuscita'));
        return;
      }

      resolve(blob);
    }, 'image/webp', quality);
  });
};

async function convertImageFileToWebp(file: File): Promise<File> {
  if (file.type === 'image/webp') {
    return file;
  }

  const image = await loadImageElementFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas non disponibile per la conversione immagine');
  }

  context.drawImage(image, 0, 0);

  const webpBlob = await canvasToWebpBlob(canvas, 0.9);
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
  return new File([webpBlob], `${baseName}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  });
}

export async function downloadImageFromUrl(imageUrl: string): Promise<File> {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Impossibile scaricare l'immagine: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  if (!contentType.startsWith('image/')) {
    throw new Error('L\'URL fornito non contiene un\'immagine valida');
  }

  const blob = await response.blob();
  const extension = contentType.includes('image/webp') ? 'webp'
    : contentType.includes('image/png') ? 'png'
    : contentType.includes('image/gif') ? 'gif'
    : 'jpg';

  const file = new File([blob], `image-from-url.${extension}`, {
    type: contentType,
    lastModified: Date.now(),
  });

  return convertImageFileToWebp(file);
}

export async function uploadAmazonImage(file: File): Promise<AmazonImageUploadResult> {
  let fileToUpload = file;

  // Converti automaticamente in WebP quando possibile, senza bloccare il flusso se fallisce.
  if (file.type.startsWith('image/')) {
    try {
      fileToUpload = await convertImageFileToWebp(file);
    } catch (error) {
      console.warn('Conversione automatica in WebP non riuscita, upload file originale.', error);
    }
  }

  const formData = new FormData();
  formData.append('image', fileToUpload);

  const endpoint = _apiBase ? `${_apiBase}/api/amazon-images` : '/api/amazon-images';

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Upload immagine fallito');
  }

  const result = (await response.json()) as AmazonImageUploadResult;

  // Se l'imageUrl è relativo e abbiamo un apiBase remoto, completalo con il baseURL
  if (_apiBase && result.imageUrl.startsWith('/')) {
    result.imageUrl = `${_apiBase}${result.imageUrl}`;
  }

  return result;
}

export async function deleteAmazonImage(imageKey: string): Promise<void> {
  if (!imageKey.trim()) {
    return;
  }

  const endpoint = _apiBase 
    ? `${_apiBase}/api/amazon-images?key=${encodeURIComponent(imageKey)}`
    : `/api/amazon-images?key=${encodeURIComponent(imageKey)}`;

  const response = await fetch(endpoint, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Eliminazione immagine fallita');
  }
}

export function validateAmazonImageUrl(url: string, timeoutMs = 7000): Promise<boolean> {
  if (!url.trim()) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;

    const finalize = (isValid: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      img.onload = null;
      img.onerror = null;
      window.clearTimeout(timeoutId);
      resolve(isValid);
    };

    const timeoutId = window.setTimeout(() => finalize(false), timeoutMs);

    img.onload = () => finalize(true);
    img.onerror = () => finalize(false);
    img.src = url;
  });
}
