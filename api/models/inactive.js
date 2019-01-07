const mongoose = require('mongoose');

const inactiveSchema = mongoose.Schema({
    DATE: {
        type: String,
        required: true,
        unique: true,
    },
    INACTIVES: [{
        PLAYER: {
            type: Number,
            ref: 'Player',
            required: true
        },
        STATUS: {
            type: String
        },
        REPORT: {
            type: String
        },
        DATE: {
            type: String
        },
        INJURY: {
            type: String
        },
        RETURN: {
            type: String
        },
    }],
});

module.exports = mongoose.model('Inactive', inactiveSchema);