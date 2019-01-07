const mongoose = require("mongoose");
const Player = require("../models/player");
const Team = require('../models/team')
const Game = require('../models/game')
const Season = require('../models/season')
const api = require('../../api')
var fs = require('fs')

exports.players = () => {
    console.log("")
    console.log("Players")
    var IDs = []
    var picturestrings = []
    api.getAllPlayers("2018-19")
        .then(data => {
            for (var index in data.resultSets[0].rowSet) {
                IDs.push(data.resultSets[0].rowSet[index][0])
                if (data.resultSets[0].rowSet[index][7] == 0) {
                    picturestrings.push("https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/" + data.resultSets[0].rowSet[index][0] + ".png")
                } else {
                    picturestrings.push("https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/" + data.resultSets[0].rowSet[index][7] + "/" + data.resultSets[0].rowSet[index][5] + "/260x190/" + data.resultSets[0].rowSet[index][0] + ".png")
                }
            }
            return IDs
        })
        .then(data => {
            for (let index = 0; index < data.length; index++) {
                (function (index) {
                    setTimeout(function () {
                        api.getPlayerInfo(data[index]).then(data2 => {
                            percentage = (index + 1) / (data.length / 100)
                            percentage = Math.round(percentage, 1)
                            process.stdout.write("Players: " + percentage + " %\r");
                            Player.findOne({
                                _id: data2.resultSets[0].rowSet[0][0]
                            }).exec().then(result => {
                                if (result == null) {
                                    var player = new Player({
                                        _id: data2.resultSets[0].rowSet[0][0],
                                        FIRST_NAME: data2.resultSets[0].rowSet[0][1],
                                        LAST_NAME: data2.resultSets[0].rowSet[0][2],
                                        PICTURE: picturestrings[index],
                                        BIRTHDATE: data2.resultSets[0].rowSet[0][6],
                                        SCHOOL: data2.resultSets[0].rowSet[0][7],
                                        COUNTRY: data2.resultSets[0].rowSet[0][8],
                                        HEIGHT: data2.resultSets[0].rowSet[0][10],
                                        WEIGHT: data2.resultSets[0].rowSet[0][11],
                                        SEASON_EXP: data2.resultSets[0].rowSet[0][12],
                                        JERSEY: data2.resultSets[0].rowSet[0][13],
                                        POSITION: data2.resultSets[0].rowSet[0][14],
                                        ROSTERSTATUS: data2.resultSets[0].rowSet[0][15],
                                        TEAM_ID: data2.resultSets[0].rowSet[0][16],
                                        TEAM_NAME: data2.resultSets[0].rowSet[0][17],
                                        TEAM_ABBREVIATION: data2.resultSets[0].rowSet[0][18],
                                        TEAM_CITY: data2.resultSets[0].rowSet[0][20],
                                        FROM_YEAR: data2.resultSets[0].rowSet[0][22],
                                        TO_YEAR: data2.resultSets[0].rowSet[0][23],
                                        DRAFT_YEAR: data2.resultSets[0].rowSet[0][24],
                                    })
                                    if (data2.resultSets[1].rowSet[0] != undefined) {
                                        player.PTS = data2.resultSets[1].rowSet[0][3]
                                        player.AST = data2.resultSets[1].rowSet[0][4]
                                        player.REB = data2.resultSets[1].rowSet[0][5]
                                        player.PIE = data2.resultSets[1].rowSet[0][6]
                                    }
                                    player.save()
                                        .then(result => {})
                                        .catch(err => {
                                            console.log(err);
                                        });
                                } else {
                                    var player = {
                                        FIRST_NAME: data2.resultSets[0].rowSet[0][1],
                                        LAST_NAME: data2.resultSets[0].rowSet[0][2],
                                        PICTURE: picturestrings[index],
                                        BIRTHDATE: data2.resultSets[0].rowSet[0][6],
                                        SCHOOL: data2.resultSets[0].rowSet[0][7],
                                        COUNTRY: data2.resultSets[0].rowSet[0][8],
                                        HEIGHT: data2.resultSets[0].rowSet[0][10],
                                        WEIGHT: data2.resultSets[0].rowSet[0][11],
                                        SEASON_EXP: data2.resultSets[0].rowSet[0][12],
                                        JERSEY: data2.resultSets[0].rowSet[0][13],
                                        POSITION: data2.resultSets[0].rowSet[0][14],
                                        ROSTERSTATUS: data2.resultSets[0].rowSet[0][15],
                                        TEAM_ID: data2.resultSets[0].rowSet[0][16],
                                        TEAM_NAME: data2.resultSets[0].rowSet[0][17],
                                        TEAM_ABBREVIATION: data2.resultSets[0].rowSet[0][18],
                                        TEAM_CITY: data2.resultSets[0].rowSet[0][20],
                                        FROM_YEAR: data2.resultSets[0].rowSet[0][22],
                                        TO_YEAR: data2.resultSets[0].rowSet[0][23],
                                        DRAFT_YEAR: data2.resultSets[0].rowSet[0][24],
                                    }
                                    if (data2.resultSets[1].rowSet[0] != undefined) {
                                        player.PTS = data2.resultSets[1].rowSet[0][3]
                                        player.AST = data2.resultSets[1].rowSet[0][4]
                                        player.REB = data2.resultSets[1].rowSet[0][5]
                                        player.PIE = data2.resultSets[1].rowSet[0][6]
                                    }
                                    Player.update({
                                            _id: data2.resultSets[0].rowSet[0][0]
                                        }, {
                                            $set: player
                                        })
                                        .then(result => {

                                        })
                                        .catch(err => {
                                            console.log(err);
                                        });
                                }
                            }).catch(err => {
                                console.log(err)
                            });
                        });
                    }, index * 500);
                })(index);
            }
        })
        .then(
        )
        .catch(err => {
            console.log(err)
        });
}