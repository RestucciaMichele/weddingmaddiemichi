<script setup lang="ts">
import { ref } from 'vue';
import NavbarAmazon from '@/components/NavbarAmazon.vue';

const searchQuery = ref('');
const showSoldProducts = ref(false);
const showAvailableProducts = ref(true);
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
      </div>
      
      <div class="itinerary-grid mt-8 grid gap-4 sm:grid-cols-3">
        <article class="travel-card rounded-2xl border border border-[#f2941b] bg-slate-50 p-5">
          <div class="flex justify-between items-start">
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2941b]">Tappa 1</p>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2941b]">26-30 Ott</p>
          </div>
          <h2 class="mt-2 text-2xl font-bold text-slate-900">Kyoto</h2>
          <p class="mt-3 text-sm leading-6 text-slate-600">Templi, giardini silenziosi e atmosfere tradizionali da
            vivere con calma.</p>
        </article>

        <article class="travel-card rounded-2xl border border border-[#f2941b] bg-slate-50 p-5">
          <div class="flex justify-between items-start">
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2941b]">Tappa 2</p>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2941b]">30 Ott - 5 Nov</p>
          </div>
          <h2 class="mt-2 text-2xl font-bold text-slate-900">Ishigaki</h2>
          <p class="mt-3 text-sm leading-6 text-slate-600">Mare cristallino, natura e giorni perfetti per staccare
            davvero la spina.</p>
        </article>

        <article class="travel-card rounded-2xl border border border-[#f2941b] bg-slate-50 p-5">
          <div class="flex justify-between items-start">
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2941b]">Tappa 3</p>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2941b]">5-10 Nov</p>
          </div>
          <h2 class="mt-2 text-2xl font-bold text-slate-900">Tokyo</h2>
          <p class="mt-3 text-sm leading-6 text-slate-600">Luci, quartieri iconici, cucina incredibile e una città che
            non smette mai di sorprendere.</p>
        </article>
      </div>




    
    </main>
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
  height: 100%;
  background: linear-gradient(180deg, #f8fafc 0%, #f3f7fb 100%);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 16px 30px -24px rgba(120, 79, 13, 0.55);
}

.experience-box {
  box-shadow: 0 16px 30px -24px rgba(120, 79, 13, 0.55);
}

.info-block {
  box-shadow: 0 14px 26px -24px rgba(15, 23, 42, 0.4);
}

.mini-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.mini-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -20px rgba(15, 23, 42, 0.4);
}

@media (max-width: 640px) {
  .viaggio-layout {
    padding-top: 0.5rem;
  }
}
</style>
