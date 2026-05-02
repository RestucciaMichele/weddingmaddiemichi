<script setup lang="ts">
import { RouterLink } from 'vue-router';

</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="text-center p-10">
      <h1 class="text-5xl font-bold text-indigo-600">404</h1>
      <p class="text-xl mt-4 text-gray-700">Ops! La pagina che cerchi non esiste.</p>
      <RouterLink
        to="/ricevimento"
        class="mt-6 inline-block bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
      >
        Torna alla Home
      </RouterLink>
    </div>
  </div>
</template>

