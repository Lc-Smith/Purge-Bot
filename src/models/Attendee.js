const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true }, // must be provided
    warJoins: { type: Number, default: 0 },
});

module.exports = mongoose.model('Attendee', attendeeSchema);