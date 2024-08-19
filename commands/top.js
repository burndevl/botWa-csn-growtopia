const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'top',
    description: 'Show the top 10 players with the most World Locks.',
    async execute(message) {
        // Path untuk folder data pengguna
        const userDir = path.join('db', 'user');

        try {
            // Membaca semua file JSON di folder data pengguna
            const files = fs.readdirSync(userDir);

            // Array untuk menyimpan data pengguna
            let users = [];

            for (const file of files) {
                const filePath = path.join(userDir, file);
                const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                // Menambahkan data pengguna ke array
                users.push({
                    phoneNumber: file.replace('.json', ''),
                    growID: userData.growID || 'Unknown',
                    worldlock: userData.worldlock || 0
                });
            }

            // Mengurutkan pengguna berdasarkan World Lock, dari yang terbanyak
            users.sort((a, b) => b.worldlock - a.worldlock);

            // Mengambil 10 pemain teratas
            const topUsers = users.slice(0, 10);

            // Menyiapkan pesan hasil
            let resultMessage = '*Top 10 Players with Most World Locks:*\n\n';
            topUsers.forEach((user, index) => {
                resultMessage += `${index + 1}. *${user.growID}* | ${user.worldlock} World Lock\n`;
            });

            // Mengirimkan hasil ke pengguna
            return message.reply(resultMessage);
        } catch (error) {
            console.error('Error retrieving top players:', error);
            return message.reply('Terjadi kesalahan saat mengambil data pemain.');
        }
    }
};
