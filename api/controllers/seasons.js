const mongoose = require("mongoose");
const Player = require("../models/player");
const Team = require('../models/team')
const Game = require('../models/game')
const Season = require('../models/season')
const seasonFunctions = require('../src/seasons')
const api = require('../../api')
const NBA = require('nba')

exports.updateSeason = (req, res, next) => {
    seasonFunctions.seasons(req.params.season, req.params.number)
    res.status(200).json({
        message: "Great"
    })
}