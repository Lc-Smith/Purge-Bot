const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const Attendee = require('../models/Attendee');
const WarAttendee = require('../models/WarAttendee');
const { isStaff } = require('../utils/isStaff');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkuser')
        .setDescription('Check war attendance stats of a specific user.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to check')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!isStaff(interaction.member)) {
            return interaction.reply({ content: "❌ You do not have permission.", flags: [MessageFlags.Ephemeral] });
        }

        const user = interaction.options.getUser('user');

        // Find attendee record
        const attendee = await Attendee.findOne({ userId: user.id });
        if (!attendee) {
            return interaction.reply({ content: `${user.username} has never joined a war.`, flags: [MessageFlags.Ephemeral] });
        }

        // Get the last war they joined
        const lastJoin = await WarAttendee.find({ userId: user.id })
            .sort({ joinedAt: -1 })
            .limit(1);

        const lastWarId = lastJoin.length ? lastJoin[0].warId : 'None';
        const lastJoinedAt = lastJoin.length ? `<t:${lastJoin[0].joinedAt}:F>` : 'N/A';

        const embed = new EmbedBuilder()
            .setTitle(`User War Stats: ${attendee.userName}`)
            .setColor("#0000ff")
            .addFields(
                { name: "User", value: `<@${attendee.userId}>`, inline: true },
                { name: "Total War Joins", value: `${attendee.warJoins}`, inline: true },
                { name: "Most Recent War", value: lastWarId.toString(), inline: true },
                { name: "Joined At", value: lastJoinedAt, inline: true }
            );

        return interaction.reply({ embeds: [embed]});
    }
};
