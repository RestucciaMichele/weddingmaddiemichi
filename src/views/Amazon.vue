<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { getAmazonProductsRealtime, validateAmazonImageUrl } from '@/services/amazon';
import type { AmazonProductDocument } from '@/types/amazon';
import NavbarAmazon from '@/components/NavbarAmazon.vue';
import tokyoDrimBanner from '@/assets/images/amazon/banner_pubblicitario_desktop_1.webp';
import tokyoDrimBannerMobile from '@/assets/images/amazon/banner_pubblicitario_mobile_1.webp';
import ishigakiBanner from '@/assets/images/amazon/banner_pubblicitario_2.webp';


const products = ref<AmazonProductDocument[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const loadError = ref('');
const showPaymentModal = ref(false);
const selectedProduct = ref<AmazonProductDocument | null>(null);
const showSoldProducts = ref(false);
const showAvailableProducts = ref(true);
const imageValidityById = ref<Record<string, boolean>>({});
const showPromoModal = ref(false);

const paymentDetails = {
  intestatario: 'Michele Restuccia',
  iban: 'IT05F0306933380100000064278',
};

let unsubscribeFromProducts: (() => void) | undefined;
let imageValidationRunId = 0;
let promoModalTimer: ReturnType<typeof window.setTimeout> | undefined;
let previousBodyOverflow = '';

const lockBodyScroll = () => {
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
};

const unlockBodyScroll = () => {
  document.body.style.overflow = previousBodyOverflow;
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
  promoModalTimer = window.setTimeout(() => {
    showPromoModal.value = true;
  }, 10000);

  unsubscribeFromProducts = getAmazonProductsRealtime((data) => {
    products.value = data;
    void (async () => {
      await validateProductsImages(data);
      loading.value = false;
    })();
  }, () => {
    loadError.value = 'Impossibile caricare i prodotti al momento.';
    loading.value = false;
  });
});

watch(showPromoModal, (isVisible) => {
  if (isVisible) {
    lockBodyScroll();
    return;
  }

  unlockBodyScroll();
});

onUnmounted(() => {
  imageValidationRunId += 1;
  if (promoModalTimer) {
    window.clearTimeout(promoModalTimer);
  }
  unlockBodyScroll();
  if (unsubscribeFromProducts) {
    unsubscribeFromProducts();
  }
});

const filteredProducts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return products.value.filter((product) => {
    const matchesSearch = !query || product.title.toLowerCase().includes(query);
    const isSold = product.sold === true;
    const matchesAvailabilityFilter =
      (isSold && showSoldProducts.value) || (!isSold && showAvailableProducts.value);
    const isImageValid = imageValidityById.value[product.id] === true;
    return matchesSearch && matchesAvailabilityFilter && isImageValid;
  });
});

const formattedPrice = (price: number) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

const openPaymentModal = (product: AmazonProductDocument) => {
  selectedProduct.value = product;
  showPaymentModal.value = true;
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
  selectedProduct.value = null;
};

const closePromoModal = () => {
  showPromoModal.value = false;
};

const buildCausale = () => {
  const productTitle = selectedProduct.value?.title || '';
  return `Nome Cognome - contributo ${productTitle}`;
};

const markImageAsInvalid = (productId: string) => {
  imageValidityById.value = {
    ...imageValidityById.value,
    [productId]: false,
  };
};
</script>

<template>
  <div class="amazon-page min-h-screen pb-10">
    <NavbarAmazon
      v-model:searchQuery="searchQuery"
      v-model:showSoldProducts="showSoldProducts"
      v-model:showAvailableProducts="showAvailableProducts"
    />

    <div class="amazon-banner-wrap relative overflow-hidden">
      <div class="amazon-banner-wash" aria-hidden="true"></div>

      <div class="relative z-10 mx-auto w-full max-w-[1500px] px-3 pt-3 sm:px-6 lg:px-8">
        <RouterLink to="/amazon/viaggio-di-nozze" class="block w-full">
          <img
            :src="tokyoDrimBanner"
            alt="Tokyo Drim Banner"
            class="amazon-banner-image hidden h-auto w-full object-cover rounded-xl md:block"
          >
          <img
            :src="tokyoDrimBannerMobile"
            alt="Tokyo Dream Il viaggio di nozze"
            class="amazon-banner-image amazon-banner-image-mobile block h-auto w-full object-cover rounded-xl md:hidden"
          >
        </RouterLink>
      </div>

      <section class="relative z-10 mx-auto max-w-7xl px-4 pt-6 pb-10 sm:pt-8 lg:pt-10">
      <div v-if="loadError" class="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        {{ loadError }}
      </div>

      <div v-if="loading" class="rounded-xl bg-white/85 p-10 text-center text-slate-600 shadow-sm">
        Caricamento articoli...
      </div>

      <div v-else-if="products.length === 0" class="rounded-xl bg-white/85 p-10 text-center text-slate-600 shadow-sm">
        Nessun prodotto ancora pubblicato.
      </div>

      <div v-else-if="filteredProducts.length === 0" class="rounded-xl bg-white/85 p-10 text-center text-slate-600 shadow-sm">
        Ci dispiace la nostra lista nozze non è così lunga. Nessun prodotto trovato per "{{ searchQuery }}".
      </div>

      <div v-else class="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        <article
          v-for="product in filteredProducts"
          :key="product.id"
          class="amazon-card overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <div class="relative h-56 bg-slate-100 p-4">
            <span
              v-if="product.sold"
              class="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow"
            >
              Venduto
            </span>
            <img
              :src="product.imageUrl"
              :alt="product.title"
              class="h-full w-full object-contain"
              loading="lazy"
              @error="markImageAsInvalid(product.id)"
            >
          </div>

          <div class="p-4">
            <h2 class="line-clamp-2 min-h-[3.1rem] text-[15px] font-medium text-slate-800">
              {{ product.title }}
            </h2>
            <p class="mt-3 text-2xl font-bold text-slate-900">{{ formattedPrice(product.price) }}</p>
            <p class="mt-1 text-xs text-slate-500">Prezzo indicativo</p>
            <button
              type="button"
              class="mt-4 w-full rounded-full border border-[#f0c14b] bg-[#ffd814] px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-[#f7ca00]"
              @click="openPaymentModal(product)"
            >
              Contribuisci
            </button>
          </div>
        </article>
      </div>
      </section>
    </div>

    <div
      v-if="showPaymentModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div class="relative w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <button
          type="button"
          class="absolute right-3 top-3 text-2xl font-bold text-gray-500 hover:text-gray-800"
          @click="closePaymentModal"
        >
          &times;
        </button>
        <h3 class="mb-4 text-center text-2xl font-bold text-slate-900">
          Contributo Amazon
        </h3>
        <div class="space-y-2 text-slate-700">
          <p><strong>Intestato a:</strong> {{ paymentDetails.intestatario }}</p>
          <p><strong>IBAN:</strong> {{ paymentDetails.iban }}</p>
          <p><strong>Importo:</strong> {{ selectedProduct ? formattedPrice(selectedProduct.price) : '' }}</p>
          <p><strong>Causale:</strong> {{ buildCausale() }}</p>
        </div>
        <div class="mt-6 flex justify-center">
          <button
            type="button"
            class="rounded bg-gray-800 px-6 py-2 text-white transition hover:bg-gray-700"
            @click="closePaymentModal"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showPromoModal"
      class="fixed inset-0 z-60 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-[2px]"
      @click.self="closePromoModal"
    >
      <div class="amazon-promo-modal relative w-full max-w-md overflow-hidden rounded-[28px] border border-[#d5b36a] bg-[#eaeded] shadow-2xl">
        <button
          type="button"
          class="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9d9d9] bg-white/95 text-2xl font-bold text-slate-600 shadow-sm transition hover:bg-white hover:text-slate-900"
          aria-label="Chiudi popup promozionale"
          @click="closePromoModal"
        >
          &times;
        </button>

        <div class="amazon-promo-shell p-3 sm:p-4">
          <div class="amazon-promo-banner relative overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-[0_16px_40px_-24px_rgba(15,23,42,0.55)]">
            <img
              :src="ishigakiBanner"
              alt="Banner pubblicitario"
              class="amazon-promo-image block h-auto w-full md:hidden"
            >
            <img
              :src="ishigakiBanner"
              alt="Banner pubblicitario"
              class="amazon-promo-image hidden h-auto w-full md:block"
            >

            <div class="absolute inset-x-0 bottom-3 flex justify-center px-4">
            <RouterLink
              to="/amazon/viaggio-di-nozze"
              class="amazon-promo-cta inline-flex items-center justify-center rounded-full border border-[#f0c14b] bg-[#ffd814] px-7 py-4 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-[#f7ca00]"
              @click="closePromoModal"
            >
              clicca per il viaggio di nozze
            </RouterLink>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.amazon-page {
  font-family: Arial, Helvetica, sans-serif;
  background-color: #eaeded;
}

.amazon-banner-wrap {
  background:
    radial-gradient(circle at 50% 10%, rgba(149, 214, 255, 0.9) 0%, rgba(149, 214, 255, 0.6) 12%, rgba(234, 237, 237, 0) 24%),
    linear-gradient(180deg, rgba(149, 214, 255, 0.92) 0%, rgba(149, 214, 255, 0.72) 18%, rgba(207, 233, 248, 0.35) 24%, rgba(234, 237, 237, 0.9) 28%, rgba(234, 237, 237, 0.98) 100%);
}

.amazon-banner-wash {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 16%, rgba(234, 237, 237, 0.55) 24%, rgba(234, 237, 237, 0.92) 30%, rgba(234, 237, 237, 0.98) 100%),
    linear-gradient(90deg, rgba(149, 214, 255, 0.34) 0%, rgba(149, 214, 255, 0.14) 20%, rgba(149, 214, 255, 0.14) 80%, rgba(149, 214, 255, 0.34) 100%);
}

.amazon-banner-image {
  mask-image: linear-gradient(to bottom, black 86%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 86%, transparent 100%);
}

.amazon-banner-image-mobile {
  mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
}

@media (max-width: 640px) {
  .amazon-topbar {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}

.amazon-logo {
  color: #ffffff;
  font-weight: 700;
  letter-spacing: -0.02em;
  position: relative;
  display: inline-block;
}

.amazon-logo::after {
  content: '';
  position: absolute;
  left: 6px;
  right: 6px;
  bottom: -3px;
  height: 2px;
  background: #ff9900;
  border-radius: 9999px;
}

.amazon-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.amazon-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px -8px rgb(15 23 42 / 0.25);
}

.amazon-promo-modal {
  animation: amazonPromoIn 0.22s ease-out;
}

.amazon-promo-shell {
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 35%, rgba(234, 237, 237, 0.96) 100%),
    linear-gradient(180deg, rgba(149, 214, 255, 0.18) 0%, rgba(234, 237, 237, 0.96) 100%);
}

.amazon-promo-image {
  mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
}

@keyframes amazonPromoIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
