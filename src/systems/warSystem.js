const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    Events,
    MessageFlags 
} = require('discord.js');
const War = require('../models/War');
const Attendee = require('../models/Attendee');
const WarAttendee = require('../models/WarAttendee');
require('dotenv').config();

const warChannelId = process.env.warChannel;
const warPingID = process.env.warPing;
const warOverPingID = process.env.warOverPing;

let warMessage = null;
let activeWar = null;

function setupWarSystem(client) {
    client.on(Events.MessageCreate, async (message) => {
        try {
            if (message.author.bot) return;
            if (message.channel.id !== warChannelId) return;

            // ----------------------
            // War start
            // ----------------------
            if (message.mentions.roles.has(warPingID)) {
                if (activeWar) return;

                const startTime = Math.floor(Date.now() / 1000);

                // Create new war
                activeWar = await War.create({
                    startTime,
                    startedBy: message.author.id
                });

                // Auto-add initiator as attendee
                let attendee = await Attendee.findOne({ userId: message.author.id });
                if (!attendee) {
                    attendee = await Attendee.create({
                        userId: message.author.id,
                        userName: message.author.username,
                        warJoins: 1
                    });
                } else {
                    attendee.warJoins += 1;
                    await attendee.save();
                }

                await WarAttendee.create({
                    warId: activeWar._id,
                    userId: message.author.id,
                    joinedAt: startTime
                });

                const warEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('War Attendance')
                    .setDescription('Click the button below to mark your attendance.')
                    .setTimestamp()
                    .setFooter({ text: 'Bagheera', iconURL: 'https://i.imgur.com/ANiuaqS.png' });

                const warRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('warButton')
                            .setLabel('Join War')
                            .setStyle(ButtonStyle.Success)
                    );

                warMessage = await message.channel.send({ embeds: [warEmbed], components: [warRow] });
            }

            // ----------------------
            // War end
            // ----------------------
            if (message.mentions.roles.has(warOverPingID)) {
                if (!activeWar || !warMessage) return;

                const endTime = Math.floor(Date.now() / 1000);

                await activeWar.updateOne({
                    endTime,
                    endedBy: message.author.id
                });

                const endedRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('warButtonEnded')
                            .setLabel('War Over')
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true)
                    );

                await warMessage.edit({ components: [endedRow] });

                warMessage = null;
                activeWar = null;
            }

        } catch (err) {
            console.error("War system error:", err);
        }
    });

    // ----------------------
    // Handle button clicks
    // ----------------------
    client.on(Events.InteractionCreate, async (interaction) => {
        try {
            if (!interaction.isButton()) return;
            if (!activeWar) return;

            if (interaction.channelId !== warChannelId) {
                return interaction.reply({
                    content: "❌ This war is not in this channel.",
                    flags: [MessageFlags.Ephemeral]
                });
            }

            if (interaction.customId !== 'warButton') return;

            const userId = interaction.user.id;
            const joinedAt = Math.floor(Date.now() / 1000);

            const alreadyJoined = await WarAttendee.findOne({
                warId: activeWar._id,
                userId
            });

            if (!alreadyJoined) {
                await WarAttendee.create({
                    warId: activeWar._id,
                    userId,
                    joinedAt
                });

                let attendee = await Attendee.findOne({ userId });
                if (!attendee) {
                    await Attendee.create({
                        userId,
                        userName: interaction.user.username,
                        warJoins: 1
                    });
                } else {
                    attendee.warJoins += 1;
                    await attendee.save();
                }
            }

            await interaction.reply({
                content: "✅ You are marked as attending.",
                flags: [MessageFlags.Ephemeral]
            });

        } catch (err) {
            console.error("War button error:", err);
        }
    });
}

module.exports = { setupWarSystem };
