<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  addAmazonProduct,
  deleteAmazonImage,
  deleteAmazonProduct,
  downloadImageFromUrl,
  getAmazonProductsRealtime,
  updateAmazonProduct,
  uploadAmazonImage,
  validateAmazonImageUrl,
} from '@/services/amazon';
import type { AmazonProductData, AmazonProductDocument } from '@/types/amazon';

const products = ref<AmazonProductDocument[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const loadError = ref('');
const imageValidityById = ref<Record<string, boolean>>({});

const showModal = ref(false);
const isEditing = ref(false);
const modalError = ref('');

const showDeleteConfirmModal = ref(false);
const productToDelete = ref<AmazonProductDocument | null>(null);

const selectedImageFile = ref<File | null>(null);
const selectedImagePreview = ref('');
const selectedImageObjectUrl = ref('');
const isUploadingImage = ref(false);
const imageUrlInput = ref('');

const getInitialProductData = (): Partial<AmazonProductDocument> => ({
  imageUrl: '',
  imageKey: '',
  title: '',
  price: 0,
  sold: false,
});

const currentProduct = ref<Partial<AmazonProductDocument>>(getInitialProductData());

let unsubscribeFromProducts: (() => void) | undefined;
let imageValidationRunId = 0;

const revokeSelectedImageObjectUrl = () => {
  if (selectedImageObjectUrl.value) {
    URL.revokeObjectURL(selectedImageObjectUrl.value);
    selectedImageObjectUrl.value = '';
  }
};

const setSelectedImagePreview = (previewUrl: string) => {
  revokeSelectedImageObjectUrl();
  selectedImagePreview.value = previewUrl;
};

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;

  revokeSelectedImageObjectUrl();
  selectedImageFile.value = file;

  if (!file) {
    selectedImagePreview.value = currentProduct.value.imageUrl || '';
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  selectedImageObjectUrl.value = objectUrl;
  selectedImagePreview.value = objectUrl;
};

const handleImageFromUrl = async () => {
  const url = imageUrlInput.value.trim();
  if (!url) {
    modalError.value = 'Inserisci un URL valido';
    return;
  }

  try {
    isUploadingImage.value = true;
    modalError.value = '';

    const downloadedFile = await downloadImageFromUrl(url);
    selectedImageFile.value = downloadedFile;

    const objectUrl = URL.createObjectURL(downloadedFile);
    revokeSelectedImageObjectUrl();
    selectedImageObjectUrl.value = objectUrl;
    selectedImagePreview.value = objectUrl;

    imageUrlInput.value = '';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Errore nel download dell\'immagine';
    modalError.value = errorMessage;
    console.error('Errore nel download immagine da URL: ', error);
  } finally {
    isUploadingImage.value = false;
  }
};

const validateProductsImages = async (list: AmazonProductDocument[]) => {
  const currentRun = ++imageValidationRunId;
  const validations = await Promise.all(
    list.map(async (product) => {
      const isValid = await validateAmazonImageUrl(product.imageUrl);
      return [product.id, isValid] as const;
    }),
  );

  if (currentRun !== imageValidationRunId) {
    return;
  }

  imageValidityById.value = Object.fromEntries(validations);
};

onMounted(() => {
  unsubscribeFromProducts = getAmazonProductsRealtime((data) => {
    products.value = data;
    void validateProductsImages(data);
    loading.value = false;
  }, () => {
    loadError.value = 'Impossibile caricare i prodotti al momento.';
    loading.value = false;
  });
});

const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) {
    return products.value;
  }

  const query = searchQuery.value.toLowerCase();
  return products.value.filter((product) => product.title.toLowerCase().includes(query));
});

const brokenProductsCount = computed(() => {
  return Object.values(imageValidityById.value).filter((isValid) => isValid === false).length;
});

const openAddModal = () => {
  isEditing.value = false;
  currentProduct.value = getInitialProductData();
  selectedImageFile.value = null;
  setSelectedImagePreview('');
  showModal.value = true;
};

const openEditModal = (product: AmazonProductDocument) => {
  isEditing.value = true;
  currentProduct.value = { ...product };
  selectedImageFile.value = null;
  setSelectedImagePreview(product.imageUrl || '');
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedImageFile.value = null;
  modalError.value = '';
  revokeSelectedImageObjectUrl();
  imageUrlInput.value = '';
};

const toggleSold = async (product: AmazonProductDocument) => {
  try {
    await updateAmazonProduct(product.id, { sold: !product.sold });
  } catch (error) {
    console.error('Errore nell\'aggiornamento dello stato venduto: ', error);
  }
};

const handleSave = async () => {
  const imageUrl = currentProduct.value.imageUrl?.trim() || '';
  const title = currentProduct.value.title?.trim() || '';
  const price = Number(currentProduct.value.price);
  const existingImageKey = currentProduct.value.imageKey || '';

  modalError.value = '';

  if (!title || Number.isNaN(price) || price <= 0) {
    modalError.value = 'Compila correttamente titolo e prezzo.';
    return;
  }

  if (!selectedImageFile.value && !imageUrl) {
    modalError.value = 'Carica un\'immagine: seleziona un file locale oppure inserisci un URL.';
    return;
  }

  try {
    isUploadingImage.value = !!selectedImageFile.value;

    let nextImageUrl = imageUrl;
    let nextImageKey = existingImageKey;

    if (selectedImageFile.value) {
      const uploadedImage = await uploadAmazonImage(selectedImageFile.value);
      nextImageUrl = uploadedImage.imageUrl;
      nextImageKey = uploadedImage.imageKey;
    }

    const payload: AmazonProductData = {
      imageUrl: nextImageUrl,
      imageKey: nextImageKey,
      title,
      price,
      sold: Boolean(currentProduct.value.sold),
    };

    if (isEditing.value && currentProduct.value.id) {
      await updateAmazonProduct(currentProduct.value.id, payload);
      if (selectedImageFile.value && existingImageKey && existingImageKey !== nextImageKey) {
        await deleteAmazonImage(existingImageKey);
      }
    } else {
      await addAmazonProduct(payload);
    }
    closeModal();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Errore nel salvataggio del prodotto';
    modalError.value = errorMessage;
    console.error('Errore nel salvataggio del prodotto: ', error);
  } finally {
    isUploadingImage.value = false;
  }
};

const handleDelete = (product: AmazonProductDocument) => {
  productToDelete.value = product;
  showDeleteConfirmModal.value = true;
};

const confirmDelete = async () => {
  if (!productToDelete.value) {
    return;
  }

  try {
    await deleteAmazonProduct(productToDelete.value.id);
    if (productToDelete.value.imageKey) {
      await deleteAmazonImage(productToDelete.value.imageKey);
    }
  } catch (error) {
    console.error('Errore nell\'eliminazione del prodotto: ', error);
  } finally {
    showDeleteConfirmModal.value = false;
    productToDelete.value = null;
  }
};

onUnmounted(() => {
  revokeSelectedImageObjectUrl();
  imageValidationRunId += 1;
  if (unsubscribeFromProducts) {
    unsubscribeFromProducts();
  }
});

const formattedPrice = (price: number) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};
</script>

<template>
  <div class="bg-gray-50 min-h-screen pt-18">
    <div class="p-4 md:p-8 max-w-7xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800">Lista Amazon Casa</h1>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-md">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-bold text-gray-800">Prodotti</h2>
            <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Errori immagine: {{ brokenProductsCount }}
            </span>
          </div>
          <div class="w-full md:w-auto flex flex-col-reverse sm:flex-row gap-4">
            <div class="relative w-full sm:w-72">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cerca prodotto..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
              </div>
            </div>

            <button
              @click="openAddModal"
              class="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Aggiungi prodotto
            </button>
          </div>
        </div>

        <div v-if="loading" class="text-center py-8 text-gray-500">Caricamento prodotti...</div>
        <div v-else-if="products.length === 0" class="text-center py-8 text-gray-500">Nessun prodotto presente.</div>
        <div v-else-if="filteredProducts.length === 0" class="text-center py-8 text-gray-500">Nessun risultato trovato per "{{ searchQuery }}".</div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <article
            v-for="product in filteredProducts"
            :key="product.id"
            class="border border-gray-200 rounded-xl p-4 flex flex-col gap-3"
          >
            <div class="relative h-42 bg-gray-100 rounded-lg overflow-hidden">
              <span
                v-if="product.sold"
                class="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow"
              >
                Venduto
              </span>
              <img :src="product.imageUrl" :alt="product.title" width="400" height="400" class="w-full h-full object-contain">
            </div>

            <div>
              <h3 class="font-semibold text-gray-800 line-clamp-2 min-h-[3rem]">{{ product.title }}</h3>
              <p class="text-lg font-bold text-gray-900 mt-2">{{ formattedPrice(product.price) }}</p>
            </div>

            <div class="flex flex-wrap gap-2 mt-auto">
              <button
                @click="toggleSold(product)"
                class="flex-1 bg-amber-500 text-white font-semibold py-2 rounded-lg hover:bg-amber-600 transition"
              >
                {{ product.sold ? 'Segna disponibile' : 'Segna venduto' }}
              </button>
              <button
                @click="openEditModal(product)"
                class="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Modifica
              </button>
              <button
                @click="handleDelete(product)"
                class="w-full bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition"
              >
                Elimina
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h3 class="text-2xl font-bold mb-6">{{ isEditing ? 'Modifica prodotto' : 'Aggiungi prodotto' }}</h3>

        <form @submit.prevent="handleSave" class="space-y-4">
          <div v-if="modalError" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {{ modalError }}
          </div>

          <div>
            <label for="imageFile" class="block text-sm font-medium text-gray-700">Immagine locale*</label>
            <input
              id="imageFile"
              type="file"
              accept="image/*"
              @change="handleImageChange"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >

            <p class="mt-1 text-xs text-gray-500">
              Seleziona un file dal computer. L'immagine verrà convertita automaticamente in WebP e salvata su Cloudflare R2.
            </p>

            <div class="mt-4 border-t border-gray-300 pt-4">
              <label for="imageUrl" class="block text-sm font-medium text-gray-700 mb-2">Oppure carica da URL</label>
              <div class="flex gap-2">
                <input
                  id="imageUrl"
                  v-model="imageUrlInput"
                  type="url"
                  placeholder="https://esempio.com/immagine.jpg"
                  class="flex-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
                  :disabled="isUploadingImage"
                >
                <button
                  type="button"
                  @click="handleImageFromUrl"
                  :disabled="isUploadingImage || !imageUrlInput.trim()"
                  class="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {{ isUploadingImage ? 'Caricamento...' : 'Carica' }}
                </button>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                Inserisci un URL diretto a un'immagine. Verrà convertita in WebP e caricata automaticamente.
              </p>
            </div>

            <div class="mt-3 overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
              <img
                v-if="selectedImagePreview"
                :src="selectedImagePreview"
                alt="Anteprima immagine"
                width="400"
                height="400"
                class="h-56 w-full bg-white object-contain"
              >
              <div v-else class="flex h-56 items-center justify-center text-sm text-gray-400">
                Nessuna immagine selezionata
              </div>
            </div>
          </div>

          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">Titolo*</label>
            <input
              id="title"
              v-model="currentProduct.title"
              type="text"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
          </div>

          <div>
            <label for="price" class="block text-sm font-medium text-gray-700">Prezzo*</label>
            <input
              id="price"
              v-model.number="currentProduct.price"
              type="number"
              min="0.01"
              step="0.01"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
          </div>

          <label class="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">
            <input
              v-model="currentProduct.sold"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            >
            Prodotto venduto
          </label>

          <div v-if="loadError" class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {{ loadError }}
          </div>

          <div class="mt-6 flex justify-end gap-4">
            <button
              type="button"
              @click="closeModal"
              class="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition"
            >
              Annulla
            </button>
            <button
              type="submit"
              :disabled="isUploadingImage"
              class="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {{ isUploadingImage ? 'Salvataggio...' : (isEditing ? 'Salva modifiche' : 'Aggiungi') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 class="text-lg font-bold mb-4">Conferma eliminazione</h3>
        <p class="text-sm text-gray-600 mb-6">Sei sicuro di voler eliminare questo prodotto?</p>
        <div class="flex justify-end gap-4">
          <button
            @click="showDeleteConfirmModal = false"
            class="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition"
          >
            Annulla
          </button>
          <button
            @click="confirmDelete"
            class="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition"
          >
            Elimina
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
