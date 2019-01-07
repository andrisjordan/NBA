const mongoose = require('mongoose');

const playerSchema = mongoose.Schema({
    _id: {
        type: Number,
        required: true,
        unique: true,
    },
    FIRST_NAME: {
        type: String,
        required: true
    },
    LAST_NAME: {
        type: String,
        required: true
    },
    PICTURE:{
        type: String,
    },
    BIRTHDATE: {
        type: String,
        required: true
    },
    SCHOOL: {
        type: String,
    },
    COUNTRY: {
        type: String,
    },
    HEIGHT: {
        type: String,
    },
    WEIGHT: {
        type: String,
    },
    SEASON_EXP: {
        type: Number,
    },
    JERSEY: {
        type: String,
    },
    POSITION: {
        type: String,
    },
    ROSTERSTATUS: {
        type: String,
    },
    TEAM_ID: {
        type: Number,
    },
    TEAM_NAME: {
        type: String,
    },
    TEAM_ABBREVIATION: {
        type: String,
    },
    TEAM_CITY: {
        type: String,
    },
    FROM_YEAR: {
        type: Number,
    },
    TO_YEAR: {
        type: Number,
    },
    DRAFT_YEAR: {
        type: String,
    },
    PTS: {
        type: Number,
    },
    AST: {
        type: Number,
    },
    REB: {
        type: Number,
    },
    PIE: {
        type: Number,
    },
});

module.exports = mongoose.model('Player', playerSchema);