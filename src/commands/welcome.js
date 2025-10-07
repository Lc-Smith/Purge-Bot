const { SlashCommandBuilder, MessageFlags } = require('discord.js');
require('dotenv').config();

const { mainChannel } = process.env;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Welcomes the pinged user in main chat.')
        .addMentionableOption(option =>
            option.setName('user')
                .setDescription('Ping the user to welcome')
                .setRequired(true)),
    async execute(interaction) {
        const executor = interaction.member; // executor of command
        const user = interaction.options.getMentionable('user'); // target user
        const { isRecruiter } = require('../utils/isRecruiter'); // adjust path as needed

        // Check recruiter permissions
        if (!isRecruiter(executor)) {
            return await interaction.reply({
                content: '❌ You do not have permission to run this command. If this is in error, contact Bagheera.',
                flags: [MessageFlags.Ephemeral]
            });
        } 

        // Fetch main channel
        const channel = await interaction.client.channels.fetch(mainChannel);

        // Send welcome message
        await channel.send(
            `## Welcome to Purge <@${user.id}>! :PurgeClan:\n` +
            `- Please read our <#832415362199846922>\n` +
            `- Collect your <#1040129914810142843>\n` +
            `- Enter your user/clan logging in <#841431029255503902> & <#1129177911866429683>\n` +
            `- Fill out an intro in <#1334665075688210443>\n` +
            `- Learn about our staff in <#1190110273818873866>\n` +
            `- Get involved with your fellow members and events in the server Events tab!\n\n` +
            `Last but certainly not least, have fun!`
        );

        // Confirmation reply
        await interaction.reply({
            content: `✅ Successfully welcomed <@${user.id}>`,
            flags: [MessageFlags.Ephemeral]
        });
    },
};
