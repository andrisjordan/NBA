const mongoose = require("mongoose");
const Player = require("../models/player");
const Team = require('../models/team')
const Game = require('../models/game')
const Season = require('../models/season')
const gameFunctions = require('../src/games')
const api = require('../../api')
var fs = require('fs')

exports.updateAllGames = (req, res, next) => {
    gameFunctions.games(req.params.season, req.params.number)
    res.status(200).json({
        message: "Great"
    })
}

exports.updateAllGamesMissed = (req, res, next) => {
    gameFunctions.gamesMissed()
    res.status(200).json({
        message: "Great"
    })
}

exports.updateAllOddsMissed = (req, res, next) => {
    gameFunctions.oddsMissed()
    res.status(200).json({
        message: "Great"
    })
}

exports.correctAllGames = (req, res, next) => {
    gameFunctions.correctGames()
    res.status(200).json({
        message: "Great"
    })
}

exports.findOdds = (req, res, next) => {
    gameFunctions.odds(req.params.season, req.params.number)
    res.status(200).json({
        message: "Great"
    })
}

function timeInFormatDays(days) {
    var date = new Date()
    var months = Math.floor(days / 31)
    var years = Math.floor(days / 372)
    days = days - months
    if (days < date.getDate()) {
        var day = date.getDate() - (days % 31) - 1;
    } else {
        var day = date.getDate() + 30 - (days % 31);
    }
    if (days < date.getDate()) {
        var monthIndex = date.getMonth() + 1 - months;
    } else {
        var monthIndex = date.getMonth() - months;
    }
    var year = date.getFullYear() - years;
    if (day < 10) {
        day = "0" + day
    }
    return monthIndex + '/' + day + '/' + year;
}