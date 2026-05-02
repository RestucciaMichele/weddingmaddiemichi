<script setup lang="ts">
import { ref } from 'vue'
import { inviaRSVP } from '@/services/rsvp'
import type { RSVPData } from '@/types/rsvp'

const email = ref('')
const nome = ref('')
const adulti = ref(1)
const bambiniRidotti = ref(0)
const bambiniGratuiti = ref(0)
const note = ref('')
const inviato = ref(false)
const errore = ref('')
const loading = ref(false)

const riepilogo = ref<RSVPData|null>(null)

const submitForm = async () => {
  errore.value = ''

  if (!nome.value || adulti.value < 1 || !email.value.includes('@')) {
    errore.value = 'Compila tutti i campi obbligatori correttamente.'
    return
  }

  if (!nome.value || adulti.value < 1) {
    errore.value = 'Inserisci un nome valido e almeno 1 partecipante'
    return
  }

  loading.value = true
  try {
    await inviaRSVP({
      email: email.value,
      nome: nome.value,
      adulti: adulti.value,
      bambiniRidotti: bambiniRidotti.value,
      bambiniGratuiti: bambiniGratuiti.value,
      note: note.value
    })
    riepilogo.value = {
      email: email.value,
      nome: nome.value,
      adulti: adulti.value,
      bambiniRidotti: bambiniRidotti.value,
      bambiniGratuiti: bambiniGratuiti.value,
      note: note.value
    }
    clear()
    inviato.value = true
  } catch (err) {
    errore.value = 'Errore durante l’invio. Riprova più tardi.'
    console.error(err)
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
                  <input v-model="email" id="email" type="email" class="rsvp-input" required />
                </div>

                <div class="rsvp-form-group">
                  <label for="nome">Nome e Cognome *</label>
                  <input v-model="nome" id="nome" class="rsvp-input" required />
                </div>

                <div class="rsvp-form-group">
                  <label for="adulti">Numero adulti *</label>
                  <input v-model="adulti" id="adulti" type="number" min="1" class="rsvp-input" required />
                </div>

                <div class="rsvp-form-group">
                  <label for="bambini-ridotti">Numero bambini, dai 3 ai 9 anni</label>
                  <input v-model="bambiniRidotti" id="bambini-ridotti" type="number" min="0" class="rsvp-input" />
                </div>

                <div class="rsvp-form-group">
                  <label for="bambini-gratuiti">Numero bambini, minori di 3 anni</label>
                  <input v-model="bambiniGratuiti" id="bambini-gratuiti" type="number" min="0" class="rsvp-input" />
                </div>

                <div class="rsvp-form-group">
                  <label for="note">Note (allergie, intolleranze, ecc)</label>
                  <textarea v-model="note" id="note" class="rsvp-input" rows="2"></textarea>
                </div>

                <div v-if="errore" class="rsvp-error">{{ errore }}</div>

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

.rsvp-input::placeholder {
  color: #aaa;
}

.rsvp-error {
  padding: 0.75rem;
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  color: #991b1b;
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
