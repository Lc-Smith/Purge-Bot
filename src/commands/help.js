const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all commands and describes how to use them'),
    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor('#340450')
            .setTitle('Purge Clan Bot Help')
            .setDescription('This bot was created by **Bagheera**. Commands are categorized for clarity.')
            .addFields(
                {
                    name: '📋 Staff Commands',
                    value: 
					'`/verify <user> <member/ally>` - Verifies a user and assigns roles.\n' +
					'`/welcome <user>` - Sends a welcome message in main chat.\n' +
					'`/checkuser <user>` - Shows a user\'s total war attendance and most recent war.\n' +
					'`/checkwar <warId>` - Displays detailed information about a specific war.\n' +
					'`/currentwar` - Displays the currently active war (attendance, start time).\n' +
					'`/recentwars` - Lists the last 5 wars and their basic info.'
                },
                {
                    name: '🔹 Misc Commands',
                    value:
					'`/help` - Shows this help page.\n' +
					'`/ping` - Replies with pong to test bot responsiveness.'
                }
            )
            .setTimestamp()
            .setFooter({ text: 'Bagheera', iconURL: 'https://i.imgur.com/ANiuaqS.png' });

        await interaction.reply({ embeds: [helpEmbed] });
    },
};
