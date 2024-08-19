module.exports = {
    name: 'help',
    execute(message, args) {
        const helpMessage = `
*LIST COMMANDS:*
- *REGISTER*: Mendaftar GrowID Baru.
- *INFO*: Menampilkan Informasi Akun.
- *TOP*: Tampilkan peringkat teratas.
- *CSN*: Mainkan permainan csn.
- *REME*: Mainkan permainan Reme.
- *QEME*: Mainkan permainan Qeme.
        `;

        message.reply(helpMessage);
    }
};
