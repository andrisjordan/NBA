const mongoose = require('mongoose');

const seasonSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    },
    REGULAR_GAMES: [
        {type: Number, ref: 'Game', required: true}
    ],
    POST_GAMES: [
        {type: Number, ref: 'Game', required: true}
    ]
})

module.exports = mongoose.model('Season', seasonSchema);