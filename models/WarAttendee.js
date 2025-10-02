const mongoose = require('mongoose');

const warAttendeeSchema = new mongoose.Schema({
    warId: { type: String, required: true },
    userId: { type: String, required: true },
    joinedAt: { type: Number, required: true }, // timestamp in seconds
});

module.exports = mongoose.model('WarAttendee', warAttendeeSchema);