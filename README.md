# Sito matrimonio Maddi & Michi

Deploy statico su Cloudflare Pages.

## Sviluppo locale

```bash
npm install
npm run dev
```

## Build locale

```bash
npm run build
npm run preview
```

## Deploy produzione (Cloudflare)

```bash
npm run deploy:cloudflare
```

## Nota su Firebase

Firebase rimane usato dall'app per:
- autenticazione area riservata
- dati RSVP
- prodotti Amazon

La parte Firebase Hosting e' stata rimossa.

## Immagini Amazon su Cloudflare R2

Per salvare le immagini caricate dal computer e mostrarle poi nella pagina pubblica:

1. Crea un bucket R2 in Cloudflare, ad esempio `amazon-images`.
2. Vai nel progetto Pages `weddingmaddiemichi`.
3. Apri `Settings` > `Functions` > `R2 bindings`.
4. Aggiungi un binding con nome `AMAZON_IMAGES` e collega il bucket creato.
5. Redeploya il sito con `npm run deploy:cloudflare`.

L'app usera' l'endpoint `/api/amazon-images` per caricare, leggere e cancellare i file. Non serve rendere pubblico il bucket R2: la funzione Pages fa da ponte verso lo storage.

Per provare l'upload in locale, usa il runtime di Cloudflare Pages invece di `vite`:

```bash
npx wrangler pages dev dist
```

Se vuoi vedere l'anteprima locale completa dopo una build:

```bash
npm run build
npx wrangler pages dev dist
```


weddingmaddiemichi.pages.dev

TODO:
- popup no in viaggio page
- bloccare le sezioni durante scroll
- quando scrolli icona menu tagliata
- fare pagina amazon viaggio
- amazon inserire possibilità percentuale di sconto del prezzo
- form rsvp inserire controllo doppio inserimento dati
- cambiare foto heroimage
- sistemare pagine errore 404 ecc.
- controllare tutte le pagine tramite mobile che siano giuste
- penultima foto laurea mia 24 ottobre 2025 -> ultima foto 24 ottobre 2026