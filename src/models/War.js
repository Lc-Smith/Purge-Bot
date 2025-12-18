const mongoose = require('mongoose');

const warSchema = new mongoose.Schema({
    guildId: { type: String, required: true, index: true}, // Server ID
    startedBy: { type: String, required: true }, // Discord user ID
    startTime: { type: Number, required: true }, // Unix timestamp
    endedBy: { type: String, default: null },    // Discord user ID or null
    endTime: { type: Number, default: null }     // Unix timestamp or null
}, { timestamps: true });

module.exports = mongoose.model('War', warSchema);
