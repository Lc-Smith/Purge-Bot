const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const War = require('../models/War');
const WarAttendee = require('../models/WarAttendee');
const { isStaff } = require('../utils/isStaff');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('currentwar')
        .setDescription('Check the current active war.'),

    async execute(interaction) {
        if (!isStaff(interaction.member)) {
            return interaction.reply({ content: "❌ You do not have permission.", flags: InteractionResponseFlags.Ephemeral });
        }

        // Find the currently active war (no endTime)
        const war = await War.findOne({ endTime: null });
        if (!war) {
            return interaction.reply({ content: "⚠️ No active war.", flags: InteractionResponseFlags.Ephemeral });
        }

        // Find attendees for this war
        const attendees = await WarAttendee.find({ warId: war._id });
        const attendeeList = attendees.length 
            ? attendees.map(a => `<@${a.userId}>`).join('\n')
            : 'None yet';

        const embed = new EmbedBuilder()
            .setTitle(`Current War #${war._id}`)
            .setColor("#00ff00")
            .addFields(
                { name: "Started By", value: `<@${war.startedBy}>`, inline: true },
                { name: "Started At", value: `<t:${war.startTime}:F>`, inline: true },
                { name: "Attendees", value: attendeeList }
            );

        return interaction.reply({ embeds: [embed]});
    }
};
