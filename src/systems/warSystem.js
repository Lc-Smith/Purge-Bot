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

/* =========================
   ENV ARRAYS (UNCHANGED NAMES)
========================= */

const guildId = JSON.parse(process.env.guildId);
const warChannel = JSON.parse(process.env.warChannel);
const warPing = JSON.parse(process.env.warPing);
const warOverPing = JSON.parse(process.env.warOverPing);

/* =========================
   HELPERS
========================= */

function getWarConfig(currentGuildId) {
    const index = guildId.indexOf(currentGuildId);
    if (index === -1) return null;

    return {
        warChannelId: warChannel[index],
        warPingID: warPing[index],
        warOverPingID: warOverPing[index]
    };
}

/* =========================
   RUNTIME STATE (PER GUILD)
========================= */

const activeWars = new Map();
// guildId => { warMessage, activeWar }

/* =========================
   WAR SYSTEM
========================= */

function setupWarSystem(client) {

    // ----------------------
    // MESSAGE HANDLER
    // ----------------------
    client.on(Events.MessageCreate, async (message) => {
        try {
            if (message.author.bot) return;
            if (!message.guild) return;

            const config = getWarConfig(message.guild.id);
            if (!config) return;

            const { warChannelId, warPingID, warOverPingID } = config;

            if (message.channel.id !== warChannelId) return;

            const guildState = activeWars.get(message.guild.id) || {
                warMessage: null,
                activeWar: null
            };

            // ----------------------
            // WAR START
            // ----------------------
            if (message.mentions.roles.has(warPingID)) {
                if (guildState.activeWar) return;

                const startTime = Math.floor(Date.now() / 1000);

                guildState.activeWar = await War.create({
                    guildId: message.guild.id,
                    startTime,
                    startedBy: message.author.id,
                });

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
                    guildId: message.guild.id,
                    warId: guildState.activeWar._id,
                    userId: message.author.id,
                    joinedAt: startTime,
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

                guildState.warMessage = await message.channel.send({
                    embeds: [warEmbed],
                    components: [warRow]
                });

                activeWars.set(message.guild.id, guildState);
            }

            // ----------------------
            // WAR END
            // ----------------------
            if (message.mentions.roles.has(warOverPingID)) {
                if (!guildState.activeWar || !guildState.warMessage) return;

                const endTime = Math.floor(Date.now() / 1000);

                await guildState.activeWar.updateOne({
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

                await guildState.warMessage.edit({ components: [endedRow] });

                activeWars.delete(message.guild.id);
            }

        } catch (err) {
            console.error("War system error:", err);
        }
    });

    // ----------------------
    // BUTTON HANDLER
    // ----------------------
    client.on(Events.InteractionCreate, async (interaction) => {
        try {
            if (!interaction.isButton()) return;
            if (!interaction.guild) return;

            const config = getWarConfig(interaction.guild.id);
            if (!config) return;

            const { warChannelId } = config;

            const guildState = activeWars.get(interaction.guild.id);
            if (!guildState) return;

            if (interaction.channelId !== warChannelId) {
                return interaction.reply({
                    content: "❌ This war is not in this channel.",
                    flags: [MessageFlags.Ephemeral]
                });
            }

            if (interaction.customId !== 'warButton') return;

            const { activeWar } = guildState;
            const userId = interaction.user.id;
            const joinedAt = Math.floor(Date.now() / 1000);

            const alreadyJoined = await WarAttendee.findOne({
                guildId: interaction.guild.id,
                warId: activeWar._id,
                userId,
            });

            if (!alreadyJoined) {
                await WarAttendee.create({
                    guildId: interaction.guild.id,
                    warId: activeWar._id,
                    userId,
                    joinedAt,
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
