const { SlashCommandBuilder, EmbedBuilder, InteractionResponseFlags } = require('discord.js');
const War = require('../models/War');
const WarAttendee = require('../models/WarAttendee');
const { isStaff } = require('../utils/isStaff');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkwar')
        .setDescription('Check details of a specific war by ID.')
        .addStringOption(option => 
            option.setName('id')
                .setDescription('ID of the war (e.g., 68decf3c0f4fa68505d51c13)')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!isStaff(interaction.member)) {
            return interaction.reply({ content: "❌ You do not have permission.", flags: InteractionResponseFlags.Ephemeral });
        }

        const warId = interaction.options.getString('id'); // warId is string
        const war = await War.findOne({ _id: warId }); // use findOne with string
        if (!war) {
            return interaction.reply({ content: `⚠️ No war found with ID ${warId}`, flags: InteractionResponseFlags.Ephemeral });
        }

        // Fetch attendees for this war
        const attendeesData = await WarAttendee.find({ warId: warId });
        const attendeeList = attendeesData.length 
            ? attendeesData.map(a => `<@${a.userId}> at <t:${a.joinedAt}:T>`).join('\n') 
            : 'None';

        const embed = new EmbedBuilder()
            .setTitle(`War #${war._id}`)
            .setColor("#00ffff")
            .addFields(
                { name: "Started By", value: `<@${war.startedBy}>`, inline: true },
                { name: "Started At", value: `<t:${war.startTime}:F>`, inline: true },
                { name: "Ended By", value: war.endedBy ? `<@${war.endedBy}>` : '❌', inline: true },
                { name: "Ended At", value: war.endTime ? `<t:${war.endTime}:F>` : '❌', inline: true },
                { name: "Attendees", value: attendeeList }
            );

        return interaction.reply({ embeds: [embed]});
    }
};
