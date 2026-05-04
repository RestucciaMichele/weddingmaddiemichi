
<style scoped>

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

@media (max-width: 1023px) {
  .cerimonia-card-video {
    max-width: 80vw;
    max-height: 70vw;
  }
  .cerimonia-card-video video {
    width: 100%;
    height: auto;
    display: block;
  }
}

@media (min-width: 1024px) {
  .cerimonia-card-video {
    max-width: 37vw;
    width: 100%;
  }
  
}

.cerimonia-section-title {
  font-family: 'Amatic SC', cursive;
  font-size: 5rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1;
  color: #7a5240;
  text-align: center;
}

</style>

<script setup lang="ts">
</script>

<template>
  <section id="cerimonia" class="h-screen flex flex-col scroll-section">
    <div class="bg-[#ffecd3] flex-1 flex items-start pt-16 md:items-center md:pt-0">
      <div class="container mx-auto px-4 w-full">
        <!-- Layout: flex-col su mobile, grid 2 colonne su desktop -->
        <div class="flex flex-col lg:grid lg:grid-cols-2 gap-8 items-start lg:items-center">
          
          <!-- Ordine su mobile: titolo (1), immagine (2), descrizione (3) -->
          <!-- Ordine            su desktop: immagine a sinistra, titolo+descrizione a destra -->
          
          <!-- BLOCCO TITOLO - Mobile: primo, Desktop: parte della colonna destra in alto -->
          <div class="w-full order-first lg:order-none lg:col-start-2 lg:row-start-1">
            <h2 class="cerimonia-section-title text-center lg:text-left">CERIMONIA</h2>
          </div>

          <!-- BLOCCO IMMAGINE - Mobile: secondo, Desktop: colonna sinistra -->
          <div class="w-full order-2 lg:order-none lg:col-start-1 lg:row-span-3 flex justify-center">
            <div class="cerimonia-card-video">
              <video
                src="../assets/mp4/cerimonia2-ottimizzato.mp4"
                autoplay
                loop
                muted
                playsinline
              >
                Il tuo browser non supporta il video.
              </video>
            </div>
          </div>

          <!-- BLOCCO DESCRIZIONE - Mobile: terzo, Desktop: colonna destra in mezzo -->
          <div class="w-full order-3 lg:order-none lg:col-start-2 lg:my-auto text-center  space-y-4">
            <h3 class="text-2xl font-semibold">Sabato 24 Ottobre 2026<br>ore 11.00</br></h3>
            <p class="text-lg">
              Presso la Basilica di Santa Maria in Calvenzano<br>
              <span class="block text-sm">
                Via della Basilica, 20070 Vizzolo Predabissi (MI)
              </span>
            </p>
            <!-- Bottone visibile solo su mobile -->
            <a
              href="https://maps.app.goo.gl/mKbe5xEK6P2vVPzi6"
              target="_blank"
              class="lg:hidden inline-block px-6 py-2 bg-[#7a5240] text-white rounded hover:bg-[#c18468] transition"
            >
              Apri su Google Maps
            </a>
          </div>
          <!-- Mappa visibile solo su desktop -->
          <div class="hidden lg:block">
            <iframe
              class="block mx-auto"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1341.4957874834208!2d9.3434393!3d45.3598648!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786d21b30ae270d%3A0x58606eb2ae210abe!2sVia%20della%20Basilica%2C%2020070%20Vizzolo%20Predabissi%20MI!5e0!3m2!1sit!2sit!4v1777718986548!5m2!1sit!2sit"
              width="70%"
              height="300"
              style="border:0; border-radius: 8px;"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>