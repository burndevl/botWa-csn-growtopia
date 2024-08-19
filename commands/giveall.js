const fs = require('fs');
const path = require('path');
const config = require('../config.json'); // Pastikan path ini sesuai dengan struktur folder Anda

module.exports = {
    name: 'giveall',
    description: 'Give World Locks to all users.',
    async execute(message, args) {
        // Memeriksa argumen yang diberikan
        if (args.length < 1) {
            return message.reply('Silakan masukkan jumlah World Lock yang ingin dibagikan.');
        }

        const amount = parseInt(args[0]);

        if (isNaN(amount) || amount <= 0) {
            return message.reply('Jumlah World Lock harus berupa angka positif.');
        }

        // Mengambil nomor WhatsApp pengirim
        const senderPhoneNumber = message.from.split('@')[0];

        // Memeriksa apakah nomor WhatsApp pengirim adalah admin
        if (!config.admins.includes(senderPhoneNumber)) {
            return message.reply('Anda tidak memiliki izin untuk menggunakan perintah ini.');
        }

        // Path untuk folder data pengguna
        const userDir = path.join('db', 'user');

        try {
            // Membaca semua file JSON di folder data pengguna
            const files = fs.readdirSync(userDir);

            for (const file of files) {
                const filePath = path.join(userDir, file);
                
                // Membaca data pengguna dari file
                const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                // Menambahkan World Lock ke setiap pengguna
                userData.worldlock += amount;

                // Menyimpan data pengguna yang diperbarui
                fs.writeFileSync(filePath, JSON.stringify(userData, null, 2), 'utf8');
            }

            return message.reply(`*Giveaway berhasil!* ${amount} World Lock telah dibagikan kepada semua pengguna.`);
        } catch (error) {
            console.error('Error processing giveaway:', error);
            return message.reply('Terjadi kesalahan saat memproses giveaway.');
        }
    }
};
