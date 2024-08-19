const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'csn',
    description: 'Play a casino game where you bet World Locks and spin the wheel.',
    async execute(message, args) {
        // Memeriksa apakah jumlah taruhan diberikan dan valid
        const betAmount = parseInt(args[0]);
        if (isNaN(betAmount) || betAmount <= 0) {
            return message.reply('Silakan masukkan jumlah taruhan World Lock yang valid.');
        }

        const userId = message.from;
        let phoneNumber = userId.split('@')[0]; // Menghapus format @c.us atau @g.us

        const userDir = path.join('db', 'user');
        const userFile = path.join(userDir, `${phoneNumber}.json`);

        if (!fs.existsSync(userFile)) {
            return message.reply('Anda tidak terdaftar. Silakan daftar terlebih dahulu.');
        }

        const userData = JSON.parse(fs.readFileSync(userFile, 'utf8'));
        if (userData.worldlock < betAmount) {
            return message.reply('Saldo World Lock Anda tidak cukup untuk taruhan ini.');
        }

        // Menghasilkan angka acak untuk pemain dan bot
        const playerSpin = Math.floor(Math.random() * 37);
        const botSpin = Math.floor(Math.random() * 37);

        let resultMessage = `*${userData.growID}* spun the wheel and got *${playerSpin} 🎰*\n*Masterbot* spun the wheel and got *${botSpin}* 🎰`;

        // Menentukan pemenang berdasarkan peraturan
        if (playerSpin === botSpin) {
            userData.worldlock -= betAmount; // Bot menang, kurangi saldo pemain
            resultMessage += `\n*Bot menang*  -${betAmount} World Lock.`;
        } else if (playerSpin > botSpin) {
            userData.worldlock += betAmount; // Pemain menang, tambahkan saldo pemain
            resultMessage += `\n*Anda menang*  +${betAmount} World Lock!`;
        } else {
            userData.worldlock -= betAmount; // Bot menang karena lebih tinggi dari pemain
            resultMessage += `\n*Bot menang*  -${betAmount} World Lock.`;
        }

        // Menyimpan data pengguna yang diperbarui
        fs.writeFileSync(userFile, JSON.stringify(userData, null, 2), 'utf8');

        // Mengirim pesan hasil kepada pemain
        return message.reply(resultMessage);
    }
};
