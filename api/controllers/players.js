const mongoose = require("mongoose");
const Player = require("../models/player");
const playerFunctions = require('../src/players')
const api = require('../../api')
const NBA = require('nba')

exports.updateAllPlayers = (req, res, next) => {
    playerFunctions.players()
    res.status(200).json({
        message: "Great"
    })
}