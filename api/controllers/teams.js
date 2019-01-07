const mongoose = require("mongoose");
const Player = require("../models/player");
const Team = require('../models/team')
const teamFunctions = require('../src/teams')
const api = require('../../api')
const NBA = require('nba')

exports.updateAllTeams = (req, res, next) => {
    teamFunctions.teams(req.params.season,Number(req.params.number))
    res.status(200).json({
        message: "Great"
    })
}