const { SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const { memberRole, verifiedRole, removeRole, recruiterRoles, InteractionResponseFlags } = process.env;
const allowedRoles = recruiterRoles.split(','); // Convert env list to array

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Gives the pinged user verified roles.')
        .addMentionableOption(option =>
            option.setName('user')
                .setDescription('Ping the user to verify')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('memberally')
                .setDescription('Verify Member or Ally')
                .setRequired(true)
                .addChoices(
                    { name: 'Member', value: 0 },
                    { name: 'Ally', value: 1 },
                )),
    async execute(interaction) {
        const executor = interaction.member; // executor of command
        const user = interaction.options.getMentionable('user'); // target user
        const intOption = interaction.options.getInteger('memberally'); // Member or Ally choice
        const { isRecruiter } = require('../utils/isRecruiter'); // adjust path as needed

        // Check recruiter permissions
        if (!isRecruiter(executor)) {
            return await interaction.reply({
                content: '❌ You do not have permission to run this command. If this is in error, contact Bagheera.',
                flags: InteractionResponseFlags.Ephemeral
            });
        }

        // Remove old role and add verified
        await user.roles.remove(removeRole);
        await user.roles.add(verifiedRole);

        // Add member role if Member selected
        if (intOption === 0) {
            await user.roles.add(memberRole);
            await interaction.reply({
                content: `✅ Successfully verified <@${user.id}> as Member.`,
                flags: InteractionResponseFlags.Ephemeral
            });
        } else {
            // Ally selected — manual assignment required
            await interaction.reply({
                content: `✅ Successfully verified <@${user.id}>.\n⚠️ Please add the required Ally role manually.`,
                flags: InteractionResponseFlags.Ephemeral
            });
        }
    },
};
