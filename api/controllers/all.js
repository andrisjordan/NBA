const mongoose = require("mongoose");
const Player = require("../models/player");
const Team = require('../models/team')
const Game = require('../models/game')
const Season = require('../models/season')
const api = require('../../api')
const playerFunctions = require('../src/players')
const gameFunctions = require('../src/games')
const seasonFunctions = require('../src/seasons')
const teamFunctions = require('../src/teams')
const inactiveFunctions = require('../src/inactives')
var fs = require('fs')

exports.updateAll = (req, res, next) => {
    var ses = "2018"
    var currentseason = ses
    var season2 = Number(currentseason.slice(2))
    season2 = season2 + 1
    if (season2 < 10) {
        season2 = "0" + season2
    }
    currentseason = Number(currentseason)
    currentseason = currentseason + "-" + season2
    Player.find({}).exec().then(player => {
        Team.find({}).exec().then(team => {
            Season.findOne({
                _id: currentseason
            }).exec().then(season => {
                game = season.REGULAR_GAMES.length
                var playerTime = (player.length + 100) * 500
                var teamTime = ((team.length + 1) * 1000) + playerTime
                var seasonTime = 30000 + teamTime
                var gamesTime = seasonTime + 50000
                inactiveFunctions.inactives()
                playerFunctions.players()
                setTimeout(function () {
                    teamFunctions.teams(ses,1)
                }, playerTime)
                setTimeout(function () {
                    seasonFunctions.seasons(ses, 1)
                }, teamTime)
                setTimeout(function () {
                    gameFunctions.gamesMissed()
                }, seasonTime)
                setTimeout(function () {
                    gameFunctions.oddsMissed()
                }, gamesTime)
            })
        })
    })
    res.status(200).json({
        message: "Great"
    })
}