<script setup lang="ts">
import { ref } from 'vue';
import NavbarAmazon from '@/components/NavbarAmazon.vue';

const searchQuery = ref('');
const showSoldProducts = ref(false);
const showAvailableProducts = ref(true);
const showPaymentModal = ref(false);

const paymentDetails = {
  intestatario: 'Michele Restuccia',
  iban: 'IT05F0306933380100000064278',
};

const openPaymentModal = () => {
  showPaymentModal.value = true;
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
};

const buildCausale = () => 'viaggio di nozze <nome cognome>';
</script>

<template>
  <div class="amazon-page min-h-screen pb-10">
    <NavbarAmazon v-model:searchQuery="searchQuery" v-model:showSoldProducts="showSoldProducts"
      v-model:showAvailableProducts="showAvailableProducts" />

    <main class="viaggio-layout mx-auto w-full max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" class="mb-6 text-sm font-medium">
        <ol class="flex flex-wrap items-center gap-2 text-slate-600">
          <li>
            <RouterLink to="/amazon" class="breadcrumb-link">Lista di Nozze</RouterLink>
          </li>
          <li aria-hidden="true" class="text-slate-400">&gt;</li>
          <li class="text-[#f2941b]">Viaggio</li>
        </ol>
      </nav>


      <div class="hero-intro max-w-3xl">
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-[#f2941b]">Viaggio di nozze</p>
        <h1 class="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Il nostro prossimo ricordo da costruire insieme.
        </h1>
        <p class="mt-6 text-lg leading-8 text-slate-700 sm:text-xl">
          Se invece vuoi contribuire a regalarci un ricordo indimenticabile, aiutaci a realizzare un sogno: il nostro
          viaggio di nozze!
        </p>
        <button
          type="button"
          class="mt-7 inline-flex items-center justify-center rounded-full border border-[#f0c14b] bg-[#ffd814] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#f7ca00]"
          @click="openPaymentModal"
        >
          Contribuisci
        </button>
      </div>
      
      <div class="itinerary-grid mt-8 grid gap-4 sm:grid-cols-3">
        <article class="travel-card group rounded-2xl bg-slate-50 p-5">
          <div class="travel-card__content">
            <div class="flex justify-between items-start">
              <p class="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2941b]">Tappa 1</p>
              <p class="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2941b]">26-30 Ott</p>
            </div>
            <h2 class="mt-2 text-2xl font-bold text-slate-900">Kyoto</h2>
            <p class="mt-3 text-sm leading-6 text-slate-600">Templi, giardini silenziosi e atmosfere tradizionali da
              vivere con calma.</p>
          </div>
          <img src="@/assets/images/amazon/kyoto.jpg" alt="Kyoto" class="travel-card__img" />
        </article>

        <article class="travel-card group rounded-2xl bg-slate-50 p-5">
          <div class="travel-card__content">
            <div class="flex justify-between items-start">
              <p class="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2941b]">Tappa 2</p>
              <p class="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2941b]">30 Ott - 5 Nov</p>
            </div>
            <h2 class="mt-2 text-2xl font-bold text-slate-900">Ishigaki</h2>
            <p class="mt-3 text-sm leading-6 text-slate-600">Mare cristallino, natura e giorni perfetti per staccare
              davvero la spina.</p>
          </div>
          <img src="@/assets/images/amazon/ishigaki.webp" alt="Ishigaki" width="800" height="600" class="travel-card__img" />
        </article>

        <article class="travel-card group rounded-2xl bg-slate-50 p-5">
          <div class="travel-card__content">
            <div class="flex justify-between items-start">
              <p class="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2941b]">Tappa 3</p>
              <p class="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2941b]">5-10 Nov</p>
            </div>
            <h2 class="mt-2 text-2xl font-bold text-slate-900">Tokyo</h2>
            <p class="mt-3 text-sm leading-6 text-slate-600">Luci, quartieri iconici, cucina incredibile e una città che
              non smette mai di sorprendere.</p>
          </div>
          <img src="@/assets/images/amazon/tokyo.jpg" alt="Tokyo" width="800" height="600" class="travel-card__img" />
        </article>
      </div>




    
    </main>
  </div>

  <div
    v-if="showPaymentModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    @click.self="closePaymentModal"
  >
    <div class="relative w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
      <button
        type="button"
        class="absolute right-3 top-3 text-2xl font-bold text-gray-500 hover:text-gray-800"
        aria-label="Chiudi finestra contributo"
        @click="closePaymentModal"
      >
        &times;
      </button>
      <h3 class="mb-4 text-center text-2xl font-bold text-slate-900">
        Contribuisci al viaggio di nozze
      </h3>
      <div class="space-y-2 text-slate-700">
        <p><strong>Intestato a:</strong> {{ paymentDetails.intestatario }}</p>
        <p><strong>IBAN:</strong> {{ paymentDetails.iban }}</p>
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
</template>

<style scoped>
.amazon-page {
  font-family: Arial, Helvetica, sans-serif;
  
  background-color: #eaeded;
}

.viaggio-layout {
  position: relative;
}

.viaggio-layout::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(36, 111, 182, 0.25) 20%, rgba(36, 111, 182, 0.25) 80%, transparent 100%);
}

.breadcrumb-link {
  color: #246fb6;
  text-decoration: none;
  transition: color 0.2s ease, text-decoration-color 0.2s ease;
  box-shadow: 0 16px 30px -24px rgba(120, 79, 13, 0.55);
}

.breadcrumb-link:hover {
  color: #f2941b;
  text-decoration: underline;
  text-decoration-color: #f2941b;
}

.hero-intro {
  position: relative;
  padding-top: 0.25rem;
}

.hero-intro::after {
  content: '';
  display: block;
  width: 50vw;
  height: 3px;
  border-radius: 999px;
  margin-top: 1.5rem;
  background: linear-gradient(90deg, #246fb6 0%, #7db4e4 55%, rgba(125, 180, 228, 0) 100%);
}

.itinerary-grid {
  align-items: stretch;
}

.travel-card {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  height: 100%;
  min-height: 400px;
  background: linear-gradient(180deg, #f8fafc 0%, #f3f7fb 100%);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 16px 30px -24px rgba(120, 79, 13, 0.55);
}

.travel-card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(248, 250, 252, 0.96) 0%,
    rgba(248, 250, 252, 0.94) 28%,
    rgba(248, 250, 252, 0.22) 56%,
    rgba(248, 250, 252, 0) 72%
  );
}

.travel-card__img {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 60%;
  object-fit: cover;
  object-position: center;
  z-index: 0;
  filter: saturate(1.08) contrast(1.04);
  transition: transform 0.35s ease;
}

.travel-card__content {
  position: relative;
  z-index: 2;
}

@media (max-width: 640px) {
  .viaggio-layout {
    padding-top: 0.5rem;
  }
}
</style>
