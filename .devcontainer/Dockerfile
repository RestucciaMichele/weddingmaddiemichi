# Usa l’immagine ufficiale DevContainer con Node.js 20 LTS
FROM mcr.microsoft.com/devcontainers/javascript-node:20

# Installa tool extra (opzionali)
RUN apt-get update && apt-get install -y \
    curl nano tmux \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# Setta la cartella di lavoro (già di default in questa immagine, ma per chiarezza)
WORKDIR /workspace
