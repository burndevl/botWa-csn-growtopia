const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'qeme',
    description: 'Play a Qeme game where you bet World Locks and compare last digit values.',
    async execute(message, args) {
        // Memeriksa apakah jumlah taruhan diberikan dan valid
        const betAmount = parseInt(args[0]);
        if (isNaN(betAmount) || betAmount <= 0) {
            return message.reply('Silakan masukkan jumlah taruhan World Lock yang valid.');
        }

        const userId = message.from;
        let phoneNumber = userId.split('@')[0];

        const userDir = path.join('db', 'user');
        const userFile = path.join(userDir, `${phoneNumber}.json`);

        if (!fs.existsSync(userFile)) {
            return message.reply('Anda tidak terdaftar. Silakan daftar terlebih dahulu.');
        }

        const userData = JSON.parse(fs.readFileSync(userFile, 'utf8'));
        if (userData.worldlock < betAmount) {
            return message.reply('Saldo World Lock Anda tidak cukup untuk taruhan ini.');
        }

        // Menghasilkan angka random antara 0 hingga 36
        const playerNumber = Math.floor(Math.random() * 37);
        const botNumber = Math.floor(Math.random() * 37);

        // Fungsi untuk menghitung Qeme berdasarkan digit terakhir
        const calculateQeme = (number) => {
            const lastDigit = number % 10;
            return lastDigit === 0 ? 9 : lastDigit;
        };

        const playerQeme = calculateQeme(playerNumber);
        const botQeme = calculateQeme(botNumber);

        let resultMessage = `*${userData.growID}* spun the wheel and got *${playerNumber}*\n`;
        resultMessage += `*Masterbot* spun the wheel and got *${botNumber}*`;

        // Angka spesial
        const specialNumbers = [10, 20, 30];
        const isPlayerSpecial = specialNumbers.includes(playerNumber);
        const isBotSpecial = specialNumbers.includes(botNumber);

        // Logika untuk menentukan pemenang
        if (isPlayerSpecial && !isBotSpecial) {
            userData.worldlock += betAmount * 3; // Pemain menang dan mendapatkan 3 kali lipat taruhan
            resultMessage += `\n*Anda menang!* 🎉 +${betAmount * 3} World Lock!`;
        } else if (!isPlayerSpecial && isBotSpecial) {
            userData.worldlock -= betAmount; // Bot menang, pemain kehilangan taruhan
            resultMessage += `\n*Bot menang!* -${betAmount} World Lock.`;
        } else if (isPlayerSpecial && isBotSpecial) {
            // Seri jika keduanya mendapatkan angka spesial
            resultMessage += `\n*Bot menang!* Keduanya mendapatkan angka spesial. Anda kehilangan ${betAmount} World Lock.`;
            userData.worldlock -= betAmount; // Bot menang dalam kasus seri angka spesial
        } else {
            if (playerQeme > botQeme) {
                userData.worldlock += betAmount; // Pemain menang jika Qeme lebih tinggi
                resultMessage += `\n*Anda menang!* 🎉 +${betAmount} World Lock!`;
            } else if (playerQeme < botQeme) {
                userData.worldlock -= betAmount; // Bot menang jika Qeme lebih tinggi
                resultMessage += `\n*Bot menang!* -${betAmount} World Lock.`;
            } else {
                // Seri jika Qeme sama
                userData.worldlock -= betAmount; // Bot menang dalam seri
                resultMessage += `\n*Bot menang!* Seri terjadi. Anda kehilangan ${betAmount} World Lock.`;
            }
        }

        // Menyimpan data pengguna yang diperbarui
        fs.writeFileSync(userFile, JSON.stringify(userData, null, 2), 'utf8');

        return message.reply(resultMessage);
    }
};
