const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'reme',
    description: 'Play the Reme game with a bet of World Locks.',
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

        // Angka spesial
        const specialNumbers = [0, 19, 28];
        // Angka yang dihitung sebagai 1
        const specialRemeNumbers = [1, 10, 29];

        // Fungsi untuk menghitung Reme
        const calculateReme = (number) => {
            if (specialRemeNumbers.includes(number)) return 1;
            return number.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
        };

        // Menghasilkan angka acak untuk pemain dan bot
        const playerNumber = Math.floor(Math.random() * 37);
        const botNumber = Math.floor(Math.random() * 37);

        const playerReme = specialNumbers.includes(playerNumber) ? null : calculateReme(playerNumber);
        const botReme = specialNumbers.includes(botNumber) ? null : calculateReme(botNumber);

        let resultMessage = `*${userData.growID}* spun the whell and got *${playerNumber} 🎰*\n*Masterbot* spun the whell and got *${botNumber}* 🎰`;

        // Menentukan pemenang berdasarkan peraturan
        if (specialNumbers.includes(playerNumber) && !specialNumbers.includes(botNumber)) {
            userData.worldlock += betAmount * 3;
            resultMessage += `\n*Anda menang!* 🎉  +${betAmount * 3} World Lock!`;
        } else if (!specialNumbers.includes(playerNumber) && specialNumbers.includes(botNumber)) {
            userData.worldlock -= betAmount;
            resultMessage += `\n*Bot menang!* - ${betAmount} World Lock.`;
        } else if (specialNumbers.includes(playerNumber) && specialNumbers.includes(botNumber)) {
            userData.worldlock -= betAmount;
            resultMessage += `\n*Seri!* -${betAmount} World Lock`;
        } else {
            if (playerReme > botReme) {
                userData.worldlock += betAmount;
                resultMessage += `\n*Anda menang!* +${betAmount} World Lock`;
            } else {
                userData.worldlock -= betAmount;
                resultMessage += `\n*Bot menang!* -${betAmount} World Lock`;
            }
        }

        // Menyimpan data pengguna yang diperbarui
        fs.writeFileSync(userFile, JSON.stringify(userData, null, 2), 'utf8');

        // Mengirim pesan hasil kepada pemain
        return message.reply(resultMessage);
    }
};
