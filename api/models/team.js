const mongoose = require('mongoose');

const teamSchema = mongoose.Schema({
    _id: {
        type: Number,
        required: true,
        unique: true,
    },
    TEAM_CITY: {
        type: String,
        required: true,
    },
    TEAM_NAME: {
        type: String,
        required: true,
    },
    TEAM_ABBREVIATION: {
        type: String,
        required: true,
    },
    TEAM_CONFERENCE: {
        type: String,
        required: true,
    },
    TEAM_DIVISION: {
        type: String,
        required: true,
    },
    PICTURE: {
        type: String,
    },
    MIN_YEAR: {
        type: Number,
    },
    MAX_YEAR: {
        type: Number,
    },
    YEARS: [{
        SEASON_YEAR: {
            type: String,
            required: true,
            unique: true
        },
        W: {
            type: Number,
        },
        L: {
            type: Number,
        },
        PCT: {
            type: Number,
        },
        CONF_RANK: {
            type: Number,
        },
        DIV_RANK: {
            type: Number,
        },
        ROSTER: [{
            type: Number,
            ref: 'Player',
            required: true
        }],
    }]
});

module.exports = mongoose.model('Team', teamSchema);