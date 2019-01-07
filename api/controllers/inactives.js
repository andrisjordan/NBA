const mongoose = require("mongoose");
const Player = require("../models/player");
const Team = require('../models/team')
const Game = require('../models/game')
const Season = require('../models/season')
const inactiveFunctions = require('../src/inactives')
const api = require('../../api')
var fs = require('fs')

exports.updateInactives = (req, res, next) => {
    inactiveFunctions.inactives()
    res.status(200).json({
        message: "Great"
    })
}