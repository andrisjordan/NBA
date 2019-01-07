const mongoose = require("mongoose");
const Player = require("../models/player");
const Team = require('../models/team')
const Game = require('../models/game')
const Season = require('../models/season')
const api = require('../../api')
var fs = require('fs')

exports.teams = (Seasons, Numbers) => {
    console.log("")
    console.log("Teams")
    var allseasons = allSeasons(Seasons,Numbers)
    for (let index2 = 0; index2 < allseasons.length; index2++) {
        (function (index2) {
            setTimeout(function () {
                var IDs = []
                api.getAllTeams().then(data => {
                        for (var index in data.resultSets[0].rowSet) {
                            if (data.resultSets[0].rowSet[index][4] != null) {
                                IDs.push(data.resultSets[0].rowSet[index][1])
                            }
                        }
                        return IDs
                    })
                    .then(data => {
                        for (let index = 0; index < data.length; index++) {
                            (function (index) {
                                setTimeout(function () {
                                    api.getTeamInfo(data[index], allseasons[index2], "Regular Season")
                                        .then(data2 => {
                                            api.getTeamRoster(data[index], allseasons[index2]).then(data3 => {
                                                percentage = (index + data.length * index2 + 1) / (data.length * allseasons.length / 100)
                                                percentage = Math.round(percentage, 1)
                                                process.stdout.write("Teams: " + percentage + " %\r");
                                                var teamids = []
                                                var picturestring = "https://stats.nba.com/media/img/teams/logos/" + data2.resultSets[0].rowSet[0][4].toUpperCase() + "_logo.svg"
                                                for (var j in data3.resultSets[0].rowSet) {
                                                    teamids.push(data3.resultSets[0].rowSet[j][12])
                                                }
                                                Player.find({
                                                        _id: {
                                                            $in: teamids
                                                        }
                                                    })
                                                    .exec()
                                                    .then(players => {
                                                        var ids = []
                                                        for (var x in players) {
                                                            ids.push(players[x]._id)
                                                        }
                                                        Team.findOne({
                                                            _id: data2.resultSets[0].rowSet[0][0]
                                                        }).exec().then(test => {
                                                            var year = {
                                                                SEASON_YEAR: data2.resultSets[0].rowSet[0][1],
                                                                W: data2.resultSets[0].rowSet[0][8],
                                                                L: data2.resultSets[0].rowSet[0][9],
                                                                PCT: data2.resultSets[0].rowSet[0][10],
                                                                CONF_RANK: data2.resultSets[0].rowSet[0][11],
                                                                DIV_RANK: data2.resultSets[0].rowSet[0][12],
                                                                MIN_YEAR: data2.resultSets[0].rowSet[0][13],
                                                                MAX_YEAR: data2.resultSets[0].rowSet[0][14],
                                                                ROSTER: ids
                                                            }
                                                            if (test == null) {
                                                                var team = new Team({
                                                                    _id: data2.resultSets[0].rowSet[0][0],
                                                                    TEAM_CITY: data2.resultSets[0].rowSet[0][2],
                                                                    TEAM_NAME: data2.resultSets[0].rowSet[0][3],
                                                                    PICTURE: picturestring,
                                                                    TEAM_ABBREVIATION: data2.resultSets[0].rowSet[0][4],
                                                                    TEAM_CONFERENCE: data2.resultSets[0].rowSet[0][5],
                                                                    TEAM_DIVISION: data2.resultSets[0].rowSet[0][6],
                                                                    YEARS: [year]
                                                                })
                                                                team.save()
                                                                    .then(result => {

                                                                    })
                                                                    .catch(err => {
                                                                        console.log(err);
                                                                    });
                                                            } else {
                                                                var team = {
                                                                    TEAM_CITY: data2.resultSets[0].rowSet[0][2],
                                                                    TEAM_NAME: data2.resultSets[0].rowSet[0][3],
                                                                    PICTURE: picturestring,
                                                                    TEAM_ABBREVIATION: data2.resultSets[0].rowSet[0][4],
                                                                    TEAM_CONFERENCE: data2.resultSets[0].rowSet[0][5],
                                                                    TEAM_DIVISION: data2.resultSets[0].rowSet[0][6],
                                                                }
                                                                Team.findOne({
                                                                    TEAM_NAME: data2.resultSets[0].rowSet[0][3],
                                                                    "YEARS.SEASON_YEAR": data2.resultSets[0].rowSet[0][1]
                                                                }).exec().then(test2 => {
                                                                    if (test2 == null) {
                                                                        Team.update({
                                                                                _id: data2.resultSets[0].rowSet[0][0]
                                                                            }, {
                                                                                $addToSet: {
                                                                                    YEARS: year
                                                                                }
                                                                            })
                                                                            .then(result => {

                                                                            })
                                                                            .catch(err => {
                                                                                console.log(err);
                                                                            });
                                                                    } else {
                                                                        if (index2 == 0) {
                                                                            Team.update({
                                                                                    _id: data2.resultSets[0].rowSet[0][0]
                                                                                }, {
                                                                                    $set: {
                                                                                        "YEARS.$[0]": year
                                                                                    }
                                                                                }, )
                                                                                .then(result => {

                                                                                })
                                                                                .catch(err => {
                                                                                    console.log(err);
                                                                                });
                                                                        }

                                                                    }
                                                                })
                                                            }
                                                        }).catch(err => {
                                                            console.log(err)
                                                        });
                                                    }).catch(err => {
                                                        console.log(err)
                                                    });
                                            }).catch(err => {
                                                console.log(err)
                                            });
                                        });
                                }, index * 1000);
                            })(index);
                        }
                    })
                    .then()
                    .catch(err => {
                        console.log(err)
                    })
            }, index2 * 1000 * 30);
        })(index2);
    }
}

function allSeasons(season,number){
    var numberOfseasons = number
    var allseasons = []
    for (let jk = 0; jk < numberOfseasons; jk++) {
        var currentseason = season
        var season2 = Number(currentseason.slice(2))
        season2 = season2 + 1 - jk
        if (season2 < 10) {
            season2 = "0" + season2
        }
        currentseason = Number(currentseason) - jk
        currentseason = currentseason + "-" + season2
        allseasons.push(currentseason)
    }
    return allseasons
}