import { db } from '@/lib/firebase'
import type { RSVPData } from '@/types/rsvp'
import { collection, addDoc } from 'firebase/firestore'

const collectionName = import.meta.env.VITE_FIREBASE_RSVP_COLLECTION || 'rsvp_dev'

// TODO: controllare univocità email
export async function inviaRSVP(data: RSVPData) {
  return await addDoc(collection(db, collectionName), {
    ...data,
    timestamp: new Date()
  })
}