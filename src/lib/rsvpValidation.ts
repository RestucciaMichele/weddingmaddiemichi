/**
 * RSVP Form Validation Utilities
 */

// RFC 5322 compliant email regex (simplified but robust)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Valid domain extensions check
const VALID_DOMAINS = ['com', 'it', 'org', 'net', 'edu', 'gov', 'co', 'uk', 'de', 'fr', 'es', 'ch', 'be', 'nl', 'eu', 'info', 'biz', 'tel', 'me', 'io', 'app', 'dev']

// Name can only contain letters, spaces, hyphens, apostrophes (Italian names)
const NAME_REGEX = /^[a-zA-Zàáâäãåèéêëìíîïòóôöõùúûüçñ\s\-']+$/

export interface ValidationError {
  field: string
  message: string
}

/**
 * Validate email format and domain
 */
export function validateEmail(email: string): ValidationError | null {
  if (!email || !email.trim()) {
    return { field: 'email', message: 'Email è obbligatoria.' }
  }

  const trimmedEmail = email.trim()

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { field: 'email', message: 'Email non valida. Controlla il formato (es. nome@dominio.com). Contatta gli sposi se necessario.' }
  }

  if (trimmedEmail.length > 50) {
    return { field: 'email', message: 'Email troppo lunga. Contatta gli sposi se necessario.' }
  }

  // Check domain extension
  const domain = trimmedEmail.split('@')[1]
  const extension = domain?.split('.').pop()?.toLowerCase()
  
  if (!extension || !VALID_DOMAINS.includes(extension)) {
    return { field: 'email', message: `Usa un dominio email comune come @gmail.com, @yahoo.it, etc. Contatta gli sposi se necessario.` }
  }

  return null
}

/**
 * Validate name format and length
 */
export function validateName(name: string): ValidationError | null {
  if (!name || !name.trim()) {
    return { field: 'nome', message: 'Nome e Cognome sono obbligatori.' }
  }

  const trimmedName = name.trim()

  if (trimmedName.length < 2) {
    return { field: 'nome', message: 'Il nominativo troppo corto. Contatta gli sposi se necessario.' }
  }

  if (trimmedName.length > 60) {
    return { field: 'nome', message: 'Il nominativo troppo lungo. Contatta gli sposi se necessario.' }
  }

  // Check for invalid characters (numbers, special symbols)
  if (!NAME_REGEX.test(trimmedName)) {
    return { field: 'nome', message: 'Il nominativo contiene caratteri non validi. Usa solo lettere, spazi e trattini.' }
  }

  // Allow multiple spaces between name and surname; only disallow consecutive hyphens
  if (/--/.test(trimmedName)) {
    return { field: 'nome', message: 'Il nominativo contiene trattini consecutivi.' }
  }

  // Check that both name and surname are present (at least 2 words)
  // Multiple spaces between words are allowed and will be normalized later
  const nameParts = trimmedName.split(/\s+/).filter(part => part.length > 0)
  if (nameParts.length < 2) {
    return { field: 'nome', message: 'Inserisci sia il Nome che il Cognome. Contatta gli sposi se necessario.' }
  }

  return null
}

/**
 * Validate number of adults
 */
export function validateAdulti(adulti: number): ValidationError | null {
  if (adulti < 1) {
    return { field: 'adulti', message: 'Deve essere presente almeno 1 adulto.' }
  }

  if (adulti > 8) {
    return { field: 'adulti', message: 'Numero di adulti non realistico. Contatta gli sposi se necessario.' }
  }

  return null
}

/**
 * Validate total number of children
 */
export function validateBambini(bambiniRidotti: number, bambiniGratuiti: number): ValidationError | null {
  const totalBambini = bambiniRidotti + bambiniGratuiti

  if (totalBambini > 8) {
    return { field: 'bambini', message: 'Numero di bambini non realistico. Contatta gli sposi se necessario.' }
  }

  return null
}

/**
 * Validate notes field
 */
export function validateNote(note: string): ValidationError | null {
  if (note && note.length > 500) {
    return { field: 'note', message: 'Note troppo lunghe (max 500 caratteri).' }
  }

  return null
}

/**
 * Validate total party size (warning if too large)
 */
export function getTotalPartySize(adulti: number, bambiniRidotti: number, bambiniGratuiti: number): number {
  return adulti + bambiniRidotti + bambiniGratuiti
}

/**
 * Check if party size should trigger a warning
 */
export function shouldSuggestNotes(totalPersone: number): boolean {
  return totalPersone > 8
}

/**
 * Normalize email (trim + lowercase)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Normalize name (trim + proper case first letter of each word)
 */
export function normalizeName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
