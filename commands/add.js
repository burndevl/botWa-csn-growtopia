const fs = require('fs');
const path = require('path');
const config = require('../config.json'); // Pastikan path ini sesuai dengan struktur folder Anda

module.exports = {
    name: 'add',
    description: 'Add World Locks to a user based on phone number and amount.',
    async execute(message, args) {
        // Memeriksa argumen yang diberikan
        if (args.length < 2) {
            return message.reply('Silakan masukkan nomor telepon (dalam format JSON) dan jumlah World Lock yang ingin ditambahkan.');
        }

        const phoneNumber = args[0];
        const amount = parseInt(args[1]);

        if (isNaN(amount) || amount <= 0) {
            return message.reply('Jumlah World Lock harus berupa angka positif.');
        }

        // Mengambil nomor WhatsApp pengirim
        const senderPhoneNumber = message.from.split('@')[0];

        // Memeriksa apakah nomor WhatsApp pengirim adalah admin
        if (!config.admins.includes(senderPhoneNumber)) {
            return message.reply('Anda tidak memiliki izin untuk menggunakan perintah ini.');
        }

        // Path untuk file data pengguna
        const userDir = path.join('db', 'user');
        const userFile = path.join(userDir, `${phoneNumber}.json`);
        
       // console.log(`File path being checked: ${userFile}`);
        
        if (!fs.existsSync(userFile)) {
            return message.reply('Data pengguna tidak ditemukan. Pastikan nomor telepon dan file JSON sudah benar.');
        }

        // Membaca dan memperbarui data pengguna
        try {
            const userData = JSON.parse(fs.readFileSync(userFile, 'utf8'));
            userData.worldlock += amount; // Menambahkan World Lock

            // Menyimpan data pengguna yang diperbarui
            fs.writeFileSync(userFile, JSON.stringify(userData, null, 2), 'utf8');

            return message.reply(`*berhasil ditambahkan!*\n+${amount} World Lock ditambahkan ke GrowID *${userData.growID}*`);
        } catch (error) {
            console.error('Error reading or writing file:', error);
            return message.reply('Terjadi kesalahan saat memproses data pengguna.');
        }
    }
};
