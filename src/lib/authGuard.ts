import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export function checkAuth(): Promise<boolean> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(!!user)
    })
  })
}
