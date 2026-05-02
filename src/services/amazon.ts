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
