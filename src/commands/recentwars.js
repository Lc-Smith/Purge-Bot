const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const War = require('../models/War');
const WarAttendee = require('../models/WarAttendee');
const { isStaff } = require('../utils/isStaff');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recentwars')
        .setDescription('View the most recent wars logged.'),

    async execute(interaction) {
        if (!isStaff(interaction.member)) {
            return interaction.reply({ content: "❌ You do not have permission.", flags: InteractionResponseFlags.Ephemeral });
        }

        const wars = await War.find().sort({ startTime: -1 }).limit(5);
        if (!wars.length) {
            return interaction.reply({ content: "No wars have been logged yet.", 
                al: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("Recent Wars")
            .setColor("#ffff00");

        for (const war of wars) {
            // Query attendees by warId (string-based)
            const attendees = await WarAttendee.find({ warId: war.id });

            embed.addFields({
                name: `War #${war.id}`,
                value: `Started: <t:${war.startTime}:F>\nEnded: ${war.endTime ? `<t:${war.endTime}:F>` : '❌ Not ended'}\nAttendees: ${attendees.length}`
            });
        }

        return interaction.reply({ embeds: [embed]});
    }
};
