<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getRsvpsRealtime, addRsvp, updateRsvp, deleteRsvp } from '@/services/area-riservata';
import type { RSVPData, RsvpDocument } from '@/types/rsvp';

const rsvps = ref<RsvpDocument[]>([]);
const loading = ref(true);
const showModal = ref(false);
const isEditing = ref(false);
const searchQuery = ref('');

// Nuovi ref per la modale di conferma eliminazione
const showDeleteConfirmModal = ref(false);
const rsvpToDeleteId = ref<string | null>(null);

const getInitialRsvpData = (): Partial<RsvpDocument> => ({
  nome: '',
  email: '',
  adulti: 1,
  bambiniRidotti: 0,
  bambiniGratuiti: 0,
  note: ''
});

const currentRsvp = ref<Partial<RsvpDocument>>(getInitialRsvpData());

let unsubscribeFromRsvps: () => void;

// --- GESTIONE DATI ---
onMounted(() => {
  unsubscribeFromRsvps = getRsvpsRealtime((data) => {
    rsvps.value = data;
    loading.value = false;
  });
});

onUnmounted(() => {
  if (unsubscribeFromRsvps) {
    unsubscribeFromRsvps();
  }
});

// --- FUNZIONALITÀ DI RICERCA ED ESPORTAZIONE ---
const filteredRsvps = computed(() => {
  if (!searchQuery.value) {
    return rsvps.value;
  }
  return rsvps.value.filter(rsvp =>
    rsvp.nome.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Funzione di esportazione CSV corretta e più robusta
const exportToCSV = () => {
  const headers = [
    "Nome", "Email", "Adulti", "Bambini Ridotti", "Bambini Gratuiti", "Note"
  ];

  const sep = ';'; // separatore adatto per Excel in italiano

  const formatCell = (cellData: any) => {
    if (cellData === null || cellData === undefined) {
      return '';
    }
    const stringData = String(cellData);
    // se contiene separatori, virgolette, newline, racchiudi tra ""
    if (stringData.includes(sep) || stringData.includes('"') || stringData.includes('\n')) {
      return `"${stringData.replace(/"/g, '""')}"`;
    }
    return stringData;
  };

  const rows = rsvps.value.map(rsvp => {
    return [
      formatCell(rsvp.nome),
      formatCell(rsvp.email),
      formatCell(rsvp.adulti),
      formatCell(rsvp.bambiniRidotti),
      formatCell(rsvp.bambiniGratuiti),
      formatCell(rsvp.note)
    ].join(sep);
  });

  const csvContent = [headers.join(sep), ...rows].join('\n');

  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "lista_rsvp_matrimonio.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


// --- FUNZIONI PER L'INTERFACCIA ---
const openAddModal = () => {
  isEditing.value = false;
  currentRsvp.value = getInitialRsvpData();
  showModal.value = true;
};

const openEditModal = (rsvp: RsvpDocument) => {
  isEditing.value = true;
  currentRsvp.value = { ...rsvp }; 
  showModal.value = true;
};

const handleSave = async () => {
  if (!currentRsvp.value.nome || !currentRsvp.value.email) {
    // Sostituito alert con console.error per evitare popup bloccanti
    console.error('I campi Nome e Email sono obbligatori.');
    return;
  }

  try {
    const { id, ...dataToSave } = currentRsvp.value;
    const payload: RSVPData = {
      nome: dataToSave.nome || '',
      email: dataToSave.email || '',
      adulti: Number(dataToSave.adulti) || 0,
      bambiniRidotti: Number(dataToSave.bambiniRidotti) || 0,
      bambiniGratuiti: Number(dataToSave.bambiniGratuiti) || 0,
      note: dataToSave.note || ''
    };

    if (isEditing.value && id) {
      await updateRsvp(id, payload);
    } else {
      await addRsvp(payload);
    }
    showModal.value = false;
  } catch (error) {
    console.error("Errore nel salvataggio: ", error);
  }
};

// Apre la modale di conferma prima di eliminare
const handleDelete = (id: string) => {
  rsvpToDeleteId.value = id;
  showDeleteConfirmModal.value = true;
};

// Esegue l'eliminazione effettiva dopo la conferma
const confirmDelete = async () => {
  if (rsvpToDeleteId.value) {
    try {
      await deleteRsvp(rsvpToDeleteId.value);
    } catch (error) {
      console.error("Errore nell'eliminazione: ", error);
    } finally {
      showDeleteConfirmModal.value = false;
      rsvpToDeleteId.value = null;
    }
  }
};

// --- DATI CALCOLATI PER LE CARD DI RIEPILOGO ---
const totalGuests = computed(() => {
  return rsvps.value.reduce((sum, rsvp) => sum + (rsvp.adulti || 0) + (rsvp.bambiniRidotti || 0) + (rsvp.bambiniGratuiti || 0), 0);
});

const guestBreakdown = computed(() => {
  return rsvps.value.reduce((breakdown, rsvp) => {
    breakdown.adulti += rsvp.adulti || 0;
    breakdown.bambiniRidotti += rsvp.bambiniRidotti || 0;
    breakdown.bambiniGratuiti += rsvp.bambiniGratuiti || 0;
    return breakdown;
  }, { adulti: 0, bambiniRidotti: 0, bambiniGratuiti: 0 });
});
</script>

<template>
  <div class="bg-gray-50 min-h-screen pt-18">
    <div class="p-4 md:p-8 max-w-7xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800">Dashboard</h1>
        <p class="mt-2 text-gray-600">Visualizza e gestisci le risposte degli invitati.</p>
      </div>

      <!-- Riepilogo -->
      <div class="flex flex-col sm:flex-row justify-center gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-md text-center flex-1 max-w-sm">
            <p class="text-sm font-medium text-gray-500">Invitati totali</p>
            <p class="text-3xl font-bold text-green-600">{{ totalGuests }}</p>
            <div class="mt-2 text-xs text-gray-500 flex justify-center gap-4">
              <span>Adulti: <strong class="text-gray-700">{{ guestBreakdown.adulti }}</strong></span>
              <span>Ridotti: <strong class="text-gray-700">{{ guestBreakdown.bambiniRidotti }}</strong></span>
              <span>Gratuiti: <strong class="text-gray-700">{{ guestBreakdown.bambiniGratuiti }}</strong></span>
            </div>
        </div>
      </div>

      <!-- Sezione Lista RSVP -->
      <div class="bg-white p-6 rounded-xl shadow-md">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Lista RSVP</h2>
          <div class="w-full md:w-auto flex flex-col-reverse sm:flex-row gap-4">
            <div class="relative w-full sm:w-64">
              <input v-model="searchQuery" type="text" placeholder="Cerca..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
              </div>
            </div>
            <div class="flex gap-4">
              <button @click="exportToCSV" class="w-1/2 sm:w-auto flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                <span>Esporta</span>
              </button>
              <button @click="openAddModal" class="w-1/2 sm:w-auto bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300">
                Aggiungi
              </button>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <div v-if="loading" class="text-center py-8 text-gray-500">Caricamento risposte...</div>
          <div v-else-if="rsvps.length === 0" class="text-center py-8 text-gray-500">Nessuna risposta ancora ricevuta.</div>
          <div v-else-if="filteredRsvps.length === 0" class="text-center py-8 text-gray-500">Nessun risultato trovato per "{{ searchQuery }}".</div>
          <ul v-else class="space-y-4">
            <li v-for="rsvp in filteredRsvps" :key="rsvp.id" class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div class="flex justify-between items-start">
                  <div>
                      <p class="font-bold text-lg text-gray-800">{{ rsvp.nome }}</p>
                      <p class="text-sm text-gray-500">{{ rsvp.email }}</p>
                  </div>
                  <div class="flex gap-2">
                    <button @click="openEditModal(rsvp)" class="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-200 transition" aria-label="Modifica">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                    </button>
                    <button @click="handleDelete(rsvp.id)" class="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-gray-200 transition" aria-label="Elimina">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                    </button>
                  </div>
              </div>
              <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span class="font-medium text-gray-500">Adulti:</span> {{ rsvp.adulti }}</div>
                  <div><span class="font-medium text-gray-500">Ridotti:</span> {{ rsvp.bambiniRidotti }}</div>
                  <div><span class="font-medium text-gray-500">Gratuiti:</span> {{ rsvp.bambiniGratuiti }}</div>
              </div>
              <p v-if="rsvp.note" class="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200 italic">"{{ rsvp.note }}"</p>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Modale Aggiunta/Modifica -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
        <h3 class="text-2xl font-bold mb-6">{{ isEditing ? 'Modifica Risposta' : 'Aggiungi Risposta' }}</h3>
        <form @submit.prevent="handleSave" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="nome" class="block text-sm font-medium text-gray-700">Nome*</label>
              <input v-model="currentRsvp.nome" type="text" id="nome" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email*</label>
              <input v-model="currentRsvp.email" type="email" id="email" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="adulti" class="block text-sm font-medium text-gray-700">Adulti</label>
              <input v-model.number="currentRsvp.adulti" type="number" id="adulti" min="0" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
              <label for="bambiniRidotti" class="block text-sm font-medium text-gray-700">Bambini Ridotti</label>
              <input v-model.number="currentRsvp.bambiniRidotti" type="number" id="bambiniRidotti" min="0" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            </div>
             <div>
              <label for="bambiniGratuiti" class="block text-sm font-medium text-gray-700">Bambini Gratuiti</label>
              <input v-model.number="currentRsvp.bambiniGratuiti" type="number" id="bambiniGratuiti" min="0" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            </div>
          </div>
          <div>
            <label for="note" class="block text-sm font-medium text-gray-700">Note</label>
            <textarea v-model="currentRsvp.note" id="note" rows="3" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>
          <div class="mt-6 flex justify-end gap-4">
            <button type="button" @click="showModal = false" class="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition">Annulla</button>
            <button type="submit" class="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition">{{ isEditing ? 'Salva Modifiche' : 'Aggiungi' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modale Conferma Eliminazione -->
    <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 class="text-lg font-bold mb-4">Conferma Eliminazione</h3>
        <p class="text-sm text-gray-600 mb-6">Sei sicuro di voler eliminare questa risposta? L'azione è irreversibile.</p>
        <div class="flex justify-end gap-4">
            <button @click="showDeleteConfirmModal = false" class="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition">Annulla</button>
            <button @click="confirmDelete" class="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition">Elimina</button>
        </div>
      </div>
    </div>
  </div>
</template>

