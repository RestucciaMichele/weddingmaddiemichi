import { db } from '@/lib/firebase'
import type { RSVPData } from '@/types/rsvp'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'

const collectionName = import.meta.env.VITE_FIREBASE_RSVP_COLLECTION || 'rsvp_dev'

/**
 * Check if email already exists in RSVP collection (prevents duplicates)
 * Query Firestore directly (requires appropriate Security Rules)
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase()
  console.log('[checkEmailExists] Checking:', normalizedEmail)

  try {
    console.log('[checkEmailExists] Querying Firestore')

    // Query by email_normalized (preferred)
    const q = query(collection(db, collectionName), where('email_normalized', '==', normalizedEmail))
    const snap = await getDocs(q)

    if (!snap.empty) {
      console.log('[checkEmailExists] DUPLICATE FOUND (email_normalized)')
      return true
    }

    // Query by email field
    const q2 = query(collection(db, collectionName), where('email', '==', normalizedEmail))
    const snap2 = await getDocs(q2)

    if (!snap2.empty) {
      console.log('[checkEmailExists] DUPLICATE FOUND (email)')
      return true
    }

    console.log('[checkEmailExists] No duplicate found (Firestore)')
    return false

  } catch (error: any) {
    console.error('[checkEmailExists] Firestore query error:', error.code, error.message)

    if (error.code === 'permission-denied') {
      throw new Error(`❌ Impossibile verificare l'email.\n\nSoluzione: Configura le Firestore Security Rules per permettere il controllo duplicati.`)
    }

    throw new Error(`Errore nella verifica email: ${error.message}`)
  }
}

/**
 * Send RSVP after validations
 */
export async function inviaRSVP(data: RSVPData) {
  return await addDoc(collection(db, collectionName), {
    ...data,
    email: data.email.toLowerCase(),
    email_normalized: data.email.toLowerCase(),
    timestamp: new Date()
  })
}