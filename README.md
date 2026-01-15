# QR Code Generator

🔳 Generatore di QR Code gratuito e open source. Crea QR code per URL, WiFi, contatti, email e altro.

**Live Demo:** [qr.bi-gen.it](https://qr.bi-gen.it)

## ✨ Funzionalità

- **7 tipi di QR Code supportati:**
  - 🔗 URL - Link a siti web
  - 📝 Testo - Testo libero
  - 📶 WiFi - Condividi credenziali di rete
  - 👤 Contatto (vCard) - Biglietti da visita digitali
  - ✉️ Email - Link mailto con oggetto precompilato
  - 📞 Telefono - Chiamata diretta
  - 💬 SMS - Messaggio precompilato

- **Personalizzazione:**
  - Colore QR e sfondo personalizzabili
  - Dimensioni regolabili (128px - 512px)
  - Export in PNG o SVG

- **Privacy First:**
  - Generazione completamente client-side
  - Nessun dato inviato a server esterni
  - Nessuna registrazione richiesta

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **QR Generation:** qrcode library
- **Language:** TypeScript

## 📦 Installazione

```bash
# Clona il repository
git clone https://github.com/lorenzogirardi/qr-code.git
cd qr-code

# Installa le dipendenze
npm install

# Avvia in sviluppo
npm run dev

# Build per produzione
npm run build
npm run start
```

## 🔧 Configurazione

Il progetto è configurato per funzionare out-of-the-box. Per personalizzare:

1. **Analytics** (opzionale): Modifica `ANALYTICS_URL` in `src/app/page.tsx`
2. **Porta**: Di default usa porta 3000, modificabile con `PORT` env var

## 📁 Struttura Progetto

```
qr-code/
├── src/
│   └── app/
│       ├── page.tsx      # Componente principale QR Generator
│       ├── globals.css   # Stili globali Tailwind
│       ├── layout.tsx    # Layout con metadata
│       └── icon.jpg      # Favicon
├── public/               # Asset statici
├── package.json
└── README.md
```

## 🌐 Deploy

### Con PM2 (Produzione)

```bash
npm run build
pm2 start npm --name "qr-code" -- start -- -p 3003
```

### Con Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📄 License

MIT License - Vedi [LICENSE](LICENSE) per i dettagli.

## 🔗 Altri Tool

Parte della suite [BI-Gen Tools](https://bi-gen.it/tools):
- [HTML to PDF Converter](https://html-to-pdf.bi-gen.it)
- [QR Code Generator](https://qr.bi-gen.it)

---

Made with ❤️ by [BI-Gen](https://bi-gen.it)
