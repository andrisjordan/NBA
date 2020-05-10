const mongoose = require("mongoose");
const aiFunctions = require('../src/ai')
const Game = require('../models/game')
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

exports.last40 = (req, res, next) => {
    aiFunctions.last40(req.params.season)
    res.status(200).json({
        message: "Great"
    })
}

exports.update = (req, res, next) => {  
    console.log("here")
    Game.find({}).select("_id GAME_DATE_EST").exec().then(games => {
        for (let index = 0 ; index < games.length ; index++ ){
            Game.update({
                _id: games[index]._id
            }, {
                $set: {
                    GAME_DATE_EST_DATE: new Date(games[index].GAME_DATE_EST)
                }
            }).exec().then(ok =>{
                console.log("done")
            })
        }
    }).catch(err => {
        console.log(err);
    });
    res.status(200).json({
        message: "Great"
    })
}