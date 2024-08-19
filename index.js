const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const client = new Client({
    authStrategy: new LocalAuth()
});

// Memuat commands dari direktori
const commands = new Map();
const commandsPath = path.join(__dirname, 'commands');
fs.readdir(commandsPath, (err, files) => {
    if (err) console.error('Error loading commands:', err);
    files.forEach(file => {
        if (file.endsWith('.js')) {
            const command = require(path.join(commandsPath, file));
            commands.set(`.${command.name}`, command);
        }
    });
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot is ready!');
});

client.on('message', message => {
    const commandPrefix = '.';
    if (message.body.startsWith(commandPrefix)) {
        const [commandName, ...args] = message.body.slice(commandPrefix.length).split(' ');
        const command = commands.get(`.${commandName}`);
        if (command) {
            command.execute(message, args);
        } else {
            message.reply('Command tidak dikenal!');
        }
    }
});

client.initialize();
