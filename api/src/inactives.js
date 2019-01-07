const mongoose = require("mongoose");
const Player = require("../models/player");
const Team = require('../models/team')
const Game = require('../models/game')
const Season = require('../models/season')
const Inactive = require('../models/inactive')
const api = require('../../api')
const request = require('request');
const cheerio = require('cheerio');
var dateFormat = require('dateformat');
var now = new Date();
var fs = require('fs')

exports.inactives = () => {
    var url = 'http://www.rotoworld.com/teams/injuries/nba/all/'
    request(url, (err, res, body) => {
        //Load HTML body into cheerio
        const $ = cheerio.load(body);
        //Scrape karma scores
        var players = []
        var allplayers = []
        $('body table > tbody > tr > td').each(function (i, elem) {
            players[i] = $(this).text();
        });

        for (var index = 0; index < players.length; index = index + 7) {
            var player = {
                name: null,
                report: null,
                pos: null,
                status: null,
                date: null,
                injury: null,
                return: null,
            }
            if (players[index] != "Name") {
                player.name = players[index]
            }
            if (players[index + 1] != "") {
                player.report = players[index + 1]
            }
            if (players[index + 2] != "POS") {
                player.pos = players[index + 2]
            }
            if (players[index + 3] != "Status") {
                player.status = players[index + 3]
            }
            if (players[index + 4] != "Date") {
                player.date = players[index + 4]
            }
            if (players[index + 5] != "Injury") {
                player.injury = players[index + 5]
            }
            if (players[index + 6] != "Returns") {
                player.return = players[index + 6]
                allplayers.push(player)
            }
        }
        updateInactives(allplayers).then(data => {
            var playersInfo = []
            for (var index in data) {
                if (data[index] != null) {
                    var info = {
                        PLAYER: data[index]._id,
                        REPORT: allplayers[index].report,
                        STATUS: allplayers[index].status,
                        DATE: allplayers[index].date,
                        INJURY: allplayers[index].injury,
                        RETURN: allplayers[index].return
                    }
                    playersInfo.push(info)
                }
            }
            var currdate = dateFormat(now, "isoDateTime").split("T")
            var bro = currdate[0]
            Inactive.findOne({
                DATE: bro
            }).exec().then(test => {
                if (test == null) {
                    var inactive = new Inactive({
                        INACTIVES: playersInfo,
                        DATE: bro
                    })
                    inactive.save()
                        .then(result => {;
                        })
                        .catch(err => {
                            console.log(err);
                        });
                } else {
                    var inactive = {
                        INACTIVES: playersInfo,
                        DATE: bro
                    }
                    Inactive.update({
                            DATE: bro
                        }, {
                            $set: inactive
                        })
                        .then(result => {

                        })
                        .catch(err => {
                            console.log(err);
                        });
                }
            })
        })
    });
    //[12, 134, ...] Scores of top posts of r/movies at time of writing
}

function updateInactives(players) {
    var firstnames = []
    var lastnames = []
    for (var index in players) {
        var names = players[index].name.split(" ")
        var firstname = names[0]
        var lastname = names[1]
        firstnames.push(firstname)
        lastnames.push(lastname)
    }
    var result = []
    players.forEach(function (data, index) {
        result.push(findplayers(firstnames[index], lastnames[index]))
    })
    return Promise.all(result);
}

function findplayers(firstname, lastname) {
    return Player.find({
        TO_YEAR: 2018
    }).select("_id FIRST_NAME LAST_NAME").exec().then(players => {
        var firstNameNormalized = firstname.split('.').join("").toUpperCase();
        var lastNameNormalized = lastname.split('.').join("").toUpperCase();
        var data = null
        for (var index in players) {
            var dbfirstNameNormalized = players[index].FIRST_NAME.split('.').join("").toUpperCase();
            var dblastNameNormalized = players[index].LAST_NAME.split('.').join("").toUpperCase();
            if (firstNameNormalized == dbfirstNameNormalized && lastNameNormalized == dblastNameNormalized) {
                data = players[index]
                break
            }
        }
        return data
    })
}