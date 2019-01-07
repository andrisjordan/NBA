const mongoose = require("mongoose");
const aiFunctions = require('../src/ai')
var fs = require('fs')

exports.distribution = (req, res, next) => {
    aiFunctions.distribution()
    res.status(200).json({
        message: "Great"
    })
}

exports.findTop5 = (req, res, next) => {
    aiFunctions.findTop5(Number(req.params.id))
    res.status(200).json({
        message: "Great"
    })
}

exports.findTop5Season = (req, res, next) => {
    aiFunctions.findTop5Season(req.params.season, Number(req.params.number))
    res.status(200).json({
        message: "Great"
    })
}

exports.findTop5SeasonMissing = (req, res, next) => {
    aiFunctions.findTop5SeasonMissing(req.params.season, Number(req.params.number))
    res.status(200).json({
        message: "Great"
    })
}

exports.elo = (req, res, next) => {
    aiFunctions.elo(req.params.season)
    res.status(200).json({
        message: "Great"
    })
}