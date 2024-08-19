const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'register',
    description: 'Register a new user with a GrowID and initialize their worldlock balance.',
    async execute(message, args) {
        // Memeriksa apakah pesan berasal dari grup
        // Misalnya, memeriksa apakah message.from mengandung ID grup
        if (message.from.includes('@g.us')) {
            return message.reply('Command ini hanya bisa digunakan di chat pribadi, bukan di grup.');
        }

        // Memeriksa apakah argumen GrowID diberikan
        if (args.length === 0) {
            return message.reply('Silakan masukkan GrowID untuk pendaftaran.');
        }

        const growID = args.join(' ').trim(); // Mengambil GrowID dan menghapus spasi di awal/akhir

        // Validasi GrowID agar hanya mengandung karakter alfanumerik dan underscore
        const validGrowID = /^[a-zA-Z0-9_]+$/;
        if (!validGrowID.test(growID)) {
            return message.reply('GrowID hanya boleh mengandung huruf, angka, dan underscore (_).');
        }

        const userId = message.from; // Format nomor WhatsApp penuh

        // Menghapus format @c.us atau @g.us dari nomor WhatsApp
        let phoneNumber = userId;
        if (phoneNumber.endsWith('@c.us') || phoneNumber.endsWith('@g.us')) {
            phoneNumber = phoneNumber.split('@')[0];
        }

        // Path untuk menyimpan data pengguna (disederhanakan)
        const userDir = path.join('db', 'user');
        const userFile = path.join(userDir, `${phoneNumber}.json`); // Menggunakan nomor WhatsApp sebagai nama file

        try {
            // Membuat direktori jika belum ada
            if (!fs.existsSync(userDir)) {
                fs.mkdirSync(userDir, { recursive: true });
            }

            // Mengecek apakah nomor WhatsApp sudah terdaftar
            if (fs.existsSync(userFile)) {
                return message.reply('Anda sudah memiliki akun dan tidak bisa membuat akun baru.');
            }

            // Mengecek apakah GrowID sudah digunakan oleh pengguna lain
            const existingUsers = fs.readdirSync(userDir);
            const existingGrowIDs = existingUsers.map(file => {
                const filePath = path.join(userDir, file);
                if (fs.statSync(filePath).isFile()) {
                    try {
                        const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                        return userData.growID;
                    } catch (err) {
                        console.error(`Error membaca file ${file}:`, err);
                        return null;
                    }
                }
                return null;
            }).filter(growID => growID !== null);

            if (existingGrowIDs.includes(growID)) {
                return message.reply('GrowID ini sudah digunakan, silakan pilih GrowID lain.');
            }

            // Membuat data pengguna baru
            const userData = {
                growID: growID,
                worldlock: 100 // Inisialisasi saldo worldlock
            };

            // Menyimpan data pengguna ke file dengan nomor WhatsApp
            fs.writeFileSync(userFile, JSON.stringify(userData, null, 2), 'utf8');

            message.reply(`*👑 Pendaftaran berhasil 👑*\nGrowID: *${growID}* 🧍\nWorld Lock: *${userData.worldlock}*`);
        } catch (error) {
            message.reply('Terjadi kesalahan saat mendaftar. Silakan coba lagi nanti.');
        }
    }
};
