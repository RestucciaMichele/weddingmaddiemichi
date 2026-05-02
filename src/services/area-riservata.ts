import { db } from '@/lib/firebase';
// Importiamo i tipi corretti dai rispettivi file
import type { RSVPData, RsvpDocument } from '@/types/rsvp';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';

const collectionName = import.meta.env.VITE_FIREBASE_RSVP_COLLECTION || 'rsvp_dev'
const rsvpCollectionRef = collection(db, collectionName);

/**
 * Ascolta i cambiamenti sulla collezione RSVP in tempo reale.
 * @param callback La funzione da eseguire ogni volta che i dati cambiano.
 * @returns Una funzione per smettere di ascoltare i cambiamenti.
 */
export function getRsvpsRealtime(callback: (rsvps: RsvpDocument[]) => void) {
  const unsubscribe = onSnapshot(rsvpCollectionRef, (querySnapshot) => {
    // L'array deve essere di tipo RsvpDocument[], perché conterrà anche l'ID
    const fetchedRsvps: RsvpDocument[] = [];
    querySnapshot.forEach((doc) => {
      fetchedRsvps.push({ id: doc.id, ...doc.data() } as RsvpDocument);
    });
    // Ordina per nome e poi chiama la callback
    const sortedRsvps = fetchedRsvps.sort((a, b) => a.nome.localeCompare(b.nome));
    callback(sortedRsvps);
  }, (error) => {
    console.error("Errore nel caricamento degli RSVP in tempo reale: ", error);
  });

  return unsubscribe;
}

/**
 * Aggiunge un nuovo documento RSVP.
 * @param data I dati del nuovo RSVP (senza ID).
 */
export async function addRsvp(data: RSVPData) {
  // Aggiungiamo anche un timestamp, come faceva il tuo service originale
  return await addDoc(rsvpCollectionRef, {
    ...data,
    timestamp: new Date()
  });
}

/**
 * Aggiorna un documento RSVP esistente.
 * @param id L'ID del documento da aggiornare.
 * @param data I nuovi dati per l'RSVP (senza ID).
 */
export async function updateRsvp(id: string, data: Partial<RSVPData>) {
  const docRef = doc(db, collectionName, id);
  return await updateDoc(docRef, data);
}

/**
 * Elimina un documento RSVP.
 * @param id L'ID del documento da eliminare.
 */
export async function deleteRsvp(id: string) {
  const docRef = doc(db, collectionName, id);
  return await deleteDoc(docRef);
}

