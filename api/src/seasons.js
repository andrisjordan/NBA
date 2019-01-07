const mongoose = require("mongoose");
const Player = require("../models/player");
const Team = require('../models/team')
const Game = require('../models/game')
const Season = require('../models/season')
const api = require('../../api')
var fs = require('fs')

exports.seasons = (Seasons, Numbers) => {
    console.log("")
    console.log("Seasons")
    var numberofseasons = Numbers
    Team.find().exec().then(teams => {
        var teamIDs = []
        for (var index in teams) {
            teamIDs.push(teams[index]._id)
        }
        return teamIDs
    }).then(data => {
        for (let index2 = 0; index2 < numberofseasons; index2++) {
            (function (index2) {
                setTimeout(function () {
                    var currentseason = Seasons
                    var season2 = Number(currentseason.slice(2))
                    season2 = season2 + 1 - index2
                    if (season2 < 10) {
                        season2 = "0" + season2
                    }
                    currentseason = Number(currentseason) - index2
                    currentseason = currentseason + "-" + season2
                    var GameIDs = []
                    var GameIDs2 = []
                    for (let index = 0; index < data.length; index++) {
                        (function (index) {
                            setTimeout(function () {
                                api.getTeamGameLog(data[index], currentseason, "Regular Season").then(data2 => {
                                    api.getTeamGameLog(data[index], currentseason, "Playoffs").then(data3 => {
                                        percentage = (index + data.length * index2 + 1) / ((data.length * numberofseasons) / 100)
                                        percentage = Math.round(percentage, 1)
                                        process.stdout.write("Seasons: " + percentage + " %\r");
                                        for (var j in data2.resultSets[0].rowSet) {
                                            var count = 0
                                            for (var g in GameIDs) {
                                                if (data2.resultSets[0].rowSet[j][1] == GameIDs[g]) {
                                                    count++
                                                    break
                                                }
                                            }
                                            if (count == 0) {
                                                GameIDs.push(data2.resultSets[0].rowSet[j][1])
                                            }
                                        }
                                        for (var z in data3.resultSets[0].rowSet) {
                                            var count2 = 0
                                            for (var f in GameIDs2) {
                                                if (data3.resultSets[0].rowSet[z][1] == GameIDs2[f]) {
                                                    count2++
                                                    break
                                                }
                                            }
                                            if (count2 == 0) {
                                                GameIDs2.push(data3.resultSets[0].rowSet[z][1])
                                            }
                                        }
                                        if (index == data.length - 1) {
                                            Season.findOne({
                                                _id: currentseason
                                            }).exec().then(test => {
                                                if (test == null) {
                                                    var season = new Season({
                                                        _id: currentseason,
                                                        REGULAR_GAMES: GameIDs,
                                                        POST_GAMES: GameIDs2
                                                    })
                                                    season.save().then(season => {

                                                    }).catch(err => {
                                                        console.log(err);
                                                    });
                                                } else {
                                                    var season = {
                                                        _id: currentseason,
                                                        REGULAR_GAMES: GameIDs,
                                                        POST_GAMES: GameIDs2
                                                    }
                                                    Season.update({
                                                            _id: currentseason
                                                        }, {
                                                            $set: season
                                                        })
                                                        .then(result => {

                                                        })
                                                        .catch(err => {
                                                            console.log(err);
                                                        });
                                                }
                                            })
                                        }
                                    })
                                })
                            }, index * 1000);
                        })(index);
                    }
                }, index2 * 30000);
            })(index2);
        }
    })
}