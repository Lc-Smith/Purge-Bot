require('./mongo'); // connect to MongoDB before anything else
const { Client, Collection, GatewayIntentBits, ActivityType, Events } = require('discord.js');
require('dotenv').config();
const { token } = process.env;
const fs = require('node:fs');
const path = require('node:path');
const Sequelize = require('sequelize');

// Import war system
const { setupWarSystem } = require('./systems/warSystem');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on('clientReady', () => {
	console.log(`Ready! User: ${client.user.tag}`);
	client.user.setActivity('Purge win', { type: ActivityType.Watching });
});

// Slash command handler
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', flags: InteractionResponseFlags.Ephemeral });
	}
});

// Initialize War system
setupWarSystem(client);

client.login(token);
