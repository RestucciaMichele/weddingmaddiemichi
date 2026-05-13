<script setup lang="ts">
import { ref, computed } from 'vue'
import { inviaRSVP } from '@/services/rsvp'
import {
  validateEmail,
  validateName,
  validateAdulti,
  validateBambini,
  validateNote,
  getTotalPartySize,
  shouldSuggestNotes,
  normalizeEmail,
  normalizeName,
} from '@/lib/rsvpValidation'
import type { RSVPData } from '@/types/rsvp'

const email = ref('')
const nome = ref('')
const adulti = ref(1)
const bambiniRidotti = ref(0)
const bambiniGratuiti = ref(0)
const note = ref('')
const inviato = ref(false)
const errore = ref('')
const erroreCampo = ref('')
const avviso = ref('')
const loading = ref(false)

const emailInput = ref<HTMLInputElement | null>(null)
const nomeInput = ref<HTMLInputElement | null>(null)
const adultiInput = ref<HTMLInputElement | null>(null)
const bambiniRidottiInput = ref<HTMLInputElement | null>(null)
const bambiniGratuitiInput = ref<HTMLInputElement | null>(null)
const noteInput = ref<HTMLTextAreaElement | null>(null)

const fieldRefs = {
  email: emailInput,
  nome: nomeInput,
  adulti: adultiInput,
  bambiniRidotti: bambiniRidottiInput,
  bambiniGratuiti: bambiniGratuitiInput,
  note: noteInput,
} as const

function clearFieldValidity(field: keyof typeof fieldRefs) {
  fieldRefs[field].value?.setCustomValidity('')
}

function showFieldError(field: keyof typeof fieldRefs, message: string) {
  const fieldRef = fieldRefs[field].value
  if (fieldRef) {
    fieldRef.setCustomValidity(message)
    fieldRef.reportValidity()
  }
}

function onEmailInput() {
  clearFieldValidity('email')
  if (erroreCampo.value === 'email' && validateEmail(email.value) === null) erroreCampo.value = ''
}

function onNomeInput() {
  clearFieldValidity('nome')
  if (erroreCampo.value === 'nome' && validateName(nome.value) === null) erroreCampo.value = ''
}

function onAdultiInput() {
  clearFieldValidity('adulti')
  if (erroreCampo.value === 'adulti' && validateAdulti(adulti.value) === null) erroreCampo.value = ''
}

function onBambiniInput() {
  clearFieldValidity('bambiniRidotti')
  clearFieldValidity('bambiniGratuiti')
  if (erroreCampo.value === 'bambini' && validateBambini(bambiniRidotti.value, bambiniGratuiti.value) === null) erroreCampo.value = ''
}

function onNoteInput() {
  clearFieldValidity('note')
  if (erroreCampo.value === 'note' && validateNote(note.value) === null) erroreCampo.value = ''
}

const riepilogo = ref<RSVPData|null>(null)

const totalPersone = computed(() => getTotalPartySize(adulti.value, bambiniRidotti.value, bambiniGratuiti.value))
const dovrebbeSuggerireNote = computed(() => shouldSuggestNotes(totalPersone.value))

const submitForm = async () => {
  errore.value = ''
  avviso.value = ''
  erroreCampo.value = ''

  clearFieldValidity('email')
  clearFieldValidity('nome')
  clearFieldValidity('adulti')
  clearFieldValidity('bambiniRidotti')
  clearFieldValidity('bambiniGratuiti')
  clearFieldValidity('note')

  // ===== VALIDATIONS =====
  
  // 1. Email validation
  const emailError = validateEmail(email.value)
  if (emailError) {
    erroreCampo.value = emailError.field
    showFieldError('email', emailError.message)
    return
  }

  // 2. Name validation
  const nameError = validateName(nome.value)
  if (nameError) {
    erroreCampo.value = nameError.field
    showFieldError('nome', nameError.message)
    return
  }

  // 3. Adulti validation
  const adultiError = validateAdulti(adulti.value)
  if (adultiError) {
    erroreCampo.value = adultiError.field
    showFieldError('adulti', adultiError.message)
    return
  }

  // 4. Bambini validation
  const bambiniError = validateBambini(bambiniRidotti.value, bambiniGratuiti.value)
  if (bambiniError) {
    erroreCampo.value = bambiniError.field
    showFieldError('bambiniRidotti', bambiniError.message)
    showFieldError('bambiniGratuiti', bambiniError.message)
    return
  }

  // 5. Note validation
  const noteError = validateNote(note.value)
  if (noteError) {
    erroreCampo.value = noteError.field
    showFieldError('note', noteError.message)
    return
  }

  // 6. Warning if party is large
  if (dovrebbeSuggerireNote.value) {
    avviso.value = `⚠️ Total di ${totalPersone.value} persone. Se necessario, aggiungi dettagli nelle note.`
  }

  loading.value = true
  try {
    // Normalize data
    const normalizedEmail = normalizeEmail(email.value)
    const normalizedNome = normalizeName(nome.value)
    console.log('[RSVP] normalizedEmail:', normalizedEmail)

    console.log('[RSVP] Invio form...')
    // Submit form
    await inviaRSVP({
      email: normalizedEmail,
      nome: normalizedNome,
      adulti: adulti.value,
      bambiniRidotti: bambiniRidotti.value,
      bambiniGratuiti: bambiniGratuiti.value,
      note: note.value.trim()
    })

    console.log('[RSVP] Form inviato con successo')
    riepilogo.value = {
      email: normalizedEmail,
      nome: normalizedNome,
      adulti: adulti.value,
      bambiniRidotti: bambiniRidotti.value,
      bambiniGratuiti: bambiniGratuiti.value,
      note: note.value.trim()
    }
    clear()
    inviato.value = true
  } catch (err: any) {
    console.error('[RSVP] Errore nel submit:', err)
    errore.value = `Errore: ${err.message || "Riprova più tardi o contatta gli sposi."}`
  } finally {
    loading.value = false
  }
}

const clear = () => {
  nome.value = ''
  email.value = ''
  adulti.value = 1
  bambiniRidotti.value = 0
  bambiniGratuiti.value = 0
  note.value = ''
  erroreCampo.value = ''

  clearFieldValidity('email')
  clearFieldValidity('nome')
  clearFieldValidity('adulti')
  clearFieldValidity('bambiniRidotti')
  clearFieldValidity('bambiniGratuiti')
  clearFieldValidity('note')
}

</script>


<template>
  <section id="rsvp-section" class="h-screen flex flex-col scroll-section">
    <div class="bg-[#F3F8F2] flex-1 flex items-start pt-4 md:items-center md:pt-0">
      <div class="container mx-auto px-4 w-full">
        <div class="flex flex-col lg:grid lg:grid-cols-2 gap-3 lg:gap-8 items-start lg:items-center">
          <div class="w-full block lg:hidden">
            <h2 class="rsvp-section-title">RSVP</h2>
          </div>
          <div class="w-full lg:col-start-1 lg:flex lg:justify-center">
            <div class="rsvp-form-container">
              <h2 class="text-2xl font-bold mb-4 text-center text-[#4f6006]">Conferma la tua presenza</h2>

              <div v-if="inviato">
                <p class="text-center font-medium mb-4 text-[#4f6006]">
                  🎉 Grazie per aver confermato la tua presenza!
                </p>

                <div class="rsvp-success-details">
                  <p><strong>Nome:</strong> {{ riepilogo?.nome }}</p>
                  <p><strong>Email:</strong> {{ riepilogo?.email }}</p>
                  <p><strong>Adulti:</strong> {{ riepilogo?.adulti }}</p>
                  <p><strong>Bambini (3 - 9 anni):</strong> {{ riepilogo?.bambiniRidotti }}</p>
                  <p><strong>Bambini (< 3 anni):</strong> {{ riepilogo?.bambiniGratuiti }}</p>
                  <p v-if="riepilogo?.note"><strong>Note:</strong> {{ riepilogo?.note }}</p>
                </div>

                <p class="rsvp-success-note">
                  Nel caso in cui siano stati inseriti dati errati o si desideri modificarli, contattare gli sposi.
                </p>
              </div>

              <form v-else @submit.prevent="submitForm" class="rsvp-form">
                <div class="rsvp-form-group">
                  <label for="email">Email *</label>
                  <input ref="emailInput" v-model="email" id="email" type="email" @input="onEmailInput" :class="['rsvp-input', { 'rsvp-input-error': erroreCampo === 'email' }]" required />
                </div>

                <div class="rsvp-form-group">
                  <label for="nome">Nome e Cognome *</label>
                  <input ref="nomeInput" v-model="nome" id="nome" @input="onNomeInput" :class="['rsvp-input', { 'rsvp-input-error': erroreCampo === 'nome' }]" required />
                </div>

                <div class="rsvp-form-group">
                  <label for="adulti">Numero adulti *</label>
                  <input ref="adultiInput" v-model.number="adulti" id="adulti" type="number" min="1" @input="onAdultiInput" :class="['rsvp-input', { 'rsvp-input-error': erroreCampo === 'adulti' }]" required />
                </div>

                <div class="rsvp-form-group">
                  <label for="bambini-ridotti">Numero bambini, dai 3 ai 9 anni</label>
                    <input ref="bambiniRidottiInput" v-model.number="bambiniRidotti" id="bambini-ridotti" type="number" min="0" @input="onBambiniInput" :class="['rsvp-input', { 'rsvp-input-error': erroreCampo === 'bambini' }]" />
                </div>

                <div class="rsvp-form-group">
                  <label for="bambini-gratuiti">Numero bambini, minori di 3 anni</label>
                  <input ref="bambiniGratuitiInput" v-model.number="bambiniGratuiti" id="bambini-gratuiti" type="number" min="0" @input="onBambiniInput" :class="['rsvp-input', { 'rsvp-input-error': erroreCampo === 'bambini' }]" />
                </div>

                <div class="rsvp-form-group">
                  <label for="note">Note (allergie, intolleranze, ecc)</label>
                  <textarea ref="noteInput" v-model="note" id="note" @input="onNoteInput" :class="['rsvp-input', { 'rsvp-input-error': erroreCampo === 'note' }]" rows="2"></textarea>
                </div>

                <div v-if="avviso" class="rsvp-warning">{{ avviso }}</div>

                <button type="submit" :disabled="loading" class="rsvp-submit-btn">
                  {{ loading ? 'Invio in corso...' : 'Invia' }}
                </button>
              </form>
            </div>
          </div>
          <div class="w-full hidden lg:block lg:col-start-2">
            <h2 class="rsvp-section-title text-left">RSVP</h2>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rsvp-form-container {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.rsvp-section-title {
  font-family: 'Amatic SC', cursive;
  font-size: 5rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
  color: #4F6006;
  text-align: center;
}

@media (min-width: 1024px) {
  .rsvp-section-title {
    text-align: left;
  }

  .rsvp-form-container {
    max-width: 380px;
  }
}

.rsvp-form {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.rsvp-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rsvp-form-group label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #4F6006;
}

.rsvp-input {
  padding: 0.5rem;
  border: 2px solid #4F6006;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: #fff;
  color: #1a1a1a;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.rsvp-input:focus {
  outline: none;
  border-color: #6F8609;
  box-shadow: 0 0 0 3px rgba(79, 96, 6, 0.1);
}

.rsvp-input.rsvp-input-error,
.rsvp-input.rsvp-input-error:focus {
  border-color: #e53e3e !important;
  box-shadow: 0 0 0 3px rgba(229,62,62,0.08);
}

.rsvp-input::placeholder {
  color: #aaa;
}

.rsvp-warning {
  padding: 0.75rem;
  background-color: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  color: #92400e;
  font-size: 0.9rem;
}

.rsvp-submit-btn {
  padding: 0.65rem 1.25rem;
  background-color: #4F6006;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  margin-top: 0.25rem;
}

.rsvp-submit-btn:hover:not(:disabled) {
  background-color: #6F8609;
  transform: translateY(-1px);
}

.rsvp-submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.rsvp-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rsvp-success {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.rsvp-success-message {
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
  color: #4F6006;
}

.rsvp-success-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  background-color: #f0f5e8;
  border: 2px solid #4F6006;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #2d3b01;
}

.rsvp-success-details p {
  margin: 0;
}

.rsvp-success-note {
  font-size: 0.85rem;
  color: #666;
  text-align: center;
}
</style>
