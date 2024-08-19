const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'info',
    description: 'Menampilkan informasi pengguna termasuk GrowID dan jumlah worldlock.',
    async execute(message, args) {
        // Memeriksa apakah pesan berasal dari grup
        if (message.from.includes('@g.us')) {
            return message.reply('Command ini hanya bisa digunakan di chat pribadi, bukan di grup.');
        }

        // Mengambil nomor WhatsApp pengguna
        const userId = message.from;
        let phoneNumber = userId;
        if (phoneNumber.endsWith('@c.us') || phoneNumber.endsWith('@g.us')) {
            phoneNumber = phoneNumber.split('@')[0];
        }

        // Path untuk file data pengguna (disederhanakan)
        const userDir = path.join('db', 'user');
        const userFile = path.join(userDir, `${phoneNumber}.json`); // Menggunakan nomor WhatsApp sebagai nama file

        try {
            // Memeriksa apakah file pengguna ada
            if (!fs.existsSync(userFile)) {
                //console.log(`Data pengguna tidak ditemukan untuk nomor WhatsApp: ${phoneNumber}`);
                return message.reply('Data pengguna tidak ditemukan. Pastikan Anda sudah terdaftar.');
            }

            // Membaca data pengguna dari file
            const userData = JSON.parse(fs.readFileSync(userFile, 'utf8'));

            // Menampilkan informasi pengguna
            let replyMessage = `*👑 Informasi 👑*\n\n`;
            replyMessage += `*GrowID:* ${userData.growID}🧍\n`;
            replyMessage += `*Jumlah World Lock:* ${userData.worldlock}🔒\n`;

            message.reply(replyMessage);
        } catch (error) {
            console.error('Terjadi kesalahan saat menampilkan informasi pengguna:', error);
            message.reply('Terjadi kesalahan saat mengambil informasi pengguna. Silakan coba lagi nanti.');
        }
    }
};
