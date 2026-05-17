<script setup lang="ts">
import { onMounted } from 'vue'
import videoUrl from '../assets/mp4/ricevimento-ottimizzato.mp4'

onMounted(() => {
  const v = document.querySelector('.cerimonia-card-video video') as HTMLVideoElement | null
  if (!v) return

  const start = () => {
    v.src = videoUrl
    v.load()
    const p = v.play()
    if (p && (p as Promise<void>).catch) (p as Promise<void>).catch(() => {})
  }

  if ('requestIdleCallback' in window) {
    ;(window as any).requestIdleCallback(start)
  } else {
    ;(window as any).addEventListener('load', start, { once: true })
    setTimeout(start, 1000)
  }
})
</script>

<template>
  <section id="ricevimento" class="h-screen flex flex-col scroll-section">
    <div class="bg-[#F3F8F2] flex-1 flex items-start pt-18 md:items-center md:pt-0">
      <div class="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <!-- Mobile: titolo sopra info -->
        <div class="block lg:hidden">
          <h2 class="ricevimento-section-title">RICEVIMENTO</h2>
        </div>
        <!-- Colonna sinistra: titolo + info -->
        <div class="text-center  space-y-4">
          <div class="hidden lg:block">
            <h2 class="ricevimento-section-title">RICEVIMENTO</h2>
          </div>
          <h3 class="text-2xl font-semibold">Dopo la cerimonia festeggeremo insieme</h3>
          <p class="text-lg">
            Presso Ristorante Gomedo<br>
            <span class="block text-sm">
              Strada Provinciale Adda, 60, 26020 Gombito CR
            </span>
          </p>
          <!-- Bottone solo su mobile -->
          <a
            href="https://maps.app.goo.gl/aNWCpkRQtrX6yXEP9"
            target="_blank"
            class="inline-block px-6 py-2 bg-[#4F6006] text-white rounded hover:bg-[#6F8609] transition lg:hidden"
          >
            Apri su Google Maps
          </a>
          <!-- Mappa solo su desktop -->
          <div class="hidden lg:block mt-4">
            <iframe
              class="block mx-auto"
              src="https://maps.google.com/maps?q=Ristorante%20Gomedo%20Strada%18Provinciale%20Adda%2060%2C%20Gombito%20CR&t=&z=19&ie=UTF8&iwloc=&output=embed"
              width="70%"
              height="300"
              style="border:0; border-radius: 8px;"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
        <!-- Colonna destra: solo video -->
        <div class="flex justify-center">
          <div class="cerimonia-card-video">
            <video autoplay loop muted playsinline preload="none">
              Il tuo browser non supporta il video.
            </video>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Usa lo stesso stile della card video cerimonia */
.cerimonia-card-video {
  width: 100%;
  margin: 0 auto;
  background: #e5cdb0;
  border-radius: 22px;
  box-shadow: 0 20px 20px -14px rgba(15,23,42,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

@media (min-width: 1024px) {
  .cerimonia-card-video {
    
    max-width: 45vw;
    width: 100%;
  }

}

.ricevimento-section-title {
  font-family: 'Amatic SC', cursive;
  font-size: 5rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
  color: #4F6006;
  text-align: center;
}
</style>
