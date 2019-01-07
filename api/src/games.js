const mongoose = require("mongoose");
const Player = require("../models/player");
const Team = require('../models/team')
const Game = require('../models/game')
const Season = require('../models/season')
const api = require('../../api')
const request = require('request');
const cheerio = require('cheerio');
var fs = require('fs')


exports.games = (Seasons, Numbers) => {
    var requestTime = 2000
    console.log("")
    console.log("Games")
    var numberOfseasons = Numbers
    for (let jk = 0; jk < numberOfseasons; jk++) {
        (function (jk) {
            setTimeout(function () {
                var currentseason = Seasons
                var season2 = Number(currentseason.slice(2))
                season2 = season2 + 1 - jk
                if (season2 < 10) {
                    season2 = "0" + season2
                }
                currentseason = Number(currentseason) - jk
                currentseason = currentseason + "-" + season2
                Season.findOne({
                        _id: currentseason
                    }).exec().then(data => {
                        var GameIDs = data.REGULAR_GAMES
                        return GameIDs
                    }).then(data => {
                        for (let index2 = 0; index2 < data.length; index2++) {
                            (function (index2) {
                                setTimeout(function () {
                                    percentage = (index2 + data.length * jk + 1) / ((data.length * numberOfseasons) / 100)
                                    percentage = Math.round(percentage, 1)
                                    process.stdout.write("Games: " + percentage + " %\r");
                                    updateGame(data[index2])
                                }, index2 * requestTime);
                            })(index2);
                        }
                    })
                    .catch(err => {
                        console.log(err)
                    });
            }, jk * 1230 * requestTime);
        })(jk);
    }
}

exports.gamesMissed = () => {
    var requestTime = 2000
    console.log("")
    console.log("Games")
    var allseasons = allSeasons("2018",19)
    Season.find({
        _id: {
            $in: allseasons
        }
    }).exec().then(data => {
        var allgames = []
        for (var index in data) {
            for (var index2 in data[index].REGULAR_GAMES) {
                allgames.push(Number(data[index].REGULAR_GAMES[index2]))
            }
        }
        return allgames
    }).then(allgames => {
        Game.find({}).select("_id").exec().then(allrecorded => {
                var allgamesrecorded = []
                for (var index in allrecorded) {
                    allgamesrecorded.push(Number(allrecorded[index]._id))
                }
                var difference = arr_diff(allgames, allgamesrecorded)
                for (var i = 0; i < difference.length; i++) {
                    if (Number(difference[i]) < 10000 || difference[i] == 'NaN' || Number(difference[i]) == 21201214) {
                        difference.splice(i, 1)
                        i--
                    }
                }
                return difference
            }).then(data => {
                console.log(data.length)
                for (let index2 = 0; index2 < data.length; index2++) {
                    (function (index2) {
                        setTimeout(function () {
                            percentage = (index2 + 1) / (data.length / 100)
                            percentage = Math.round(percentage, 1)
                            process.stdout.write("Games: " + percentage + " %\r");
                            updateGame(data[index2])
                        }, index2 * requestTime);
                    })(index2);
                }
            })
            .catch(err => {
                console.log(err)
            });
    })
}

exports.oddsMissed = () => {
    var requestTime = 2000
    console.log("")
    console.log("Games")
    var allseasons = allSeasons("2018",1)
    Season.find({
        _id: {
            $in: allseasons
        }
    }).exec().then(data => {
        var allgames = []
        for (var index in data) {
            for (var index2 in data[index].REGULAR_GAMES) {
                if (typeof data[index].REGULAR_GAMES[index2] === 'number') {
                    allgames.push(Number(data[index].REGULAR_GAMES[index2]))
                }
            }
        }
        return allgames
    }).then(allgames => {
        return Game.find({
            _id: {
                $in: allgames
            }
        }).select("_id ODDS_HOME ODDS_VISITOR").exec().then(allrecorded => {
            var difference = []
            for (var index in allrecorded) {
                if (allrecorded[index].ODDS_HOME == null || allrecorded[index].ODDS_HOME == undefined || allrecorded[index].ODDS_VISITOR == null || allrecorded[index].ODDS_VISITOR == undefined) {
                    difference.push(Number(allrecorded[index]._id))
                }
            }
            console.log(difference.length)
            return difference
        })
    }).then(allgames => {
        return Game.find({
            _id: {
                $in: allgames
            }
        }).select("_id GAME_DATE_EST").sort({
            _id: 1
        }).exec().then(games => {
            return games
        })
    }).then(data => {
        oddsScrape(data)
    })
}

exports.correctGames = () => {
    var allseasons = allSeasons("2018",19)
    return Season.find({
        _id: {
            $in: allseasons
        }
    }).exec().then(data => {
        var allgames = []
        for (var index in data) {
            for (var index2 in data[index].REGULAR_GAMES) {
                if (typeof data[index].REGULAR_GAMES[index2] === 'number') {
                    allgames.push(Number(data[index].REGULAR_GAMES[index2]))
                }
            }
        }
        return allgames
    }).then(allgames => {
        return returnValues(allgames)
    })
}

exports.odds = (Season, Numbers) => {
    console.log("")
    console.log("Odds")
    allGameDates(Season, Number(Numbers)).then(data => {
        oddsScrape(data)
    })
    //[12, 134, ...] Scores of top posts of r/movies at time of writing
}

function oddsScrape(data) {
    var dates = convertDates(data)
    var ogDates = convertDates2(data)
    for (var i = 0; i < dates.length; i++) {
        (function (i) {
            setTimeout(function () {
                percentage = (i + 1) / (dates.length / 100)
                percentage = Math.round(percentage, 1)
                process.stdout.write("Odds: " + percentage + " %\r");
                var url = 'https://www.sportsbookreview.com/betting-odds/nba-basketball/money-line/?date=' + dates[i]
                request(url, (err, res, body) => {
                    //Load HTML body into cheerio
                    const $ = cheerio.load(body);
                    //Scrape karma scores
                    var teams = []
                    var odds = []
                    var pointshome = []
                    var pointsaway = []
                    $('._3qi53').each(function (i, elem) {
                        teams[i] = $(this).text();
                    });
                    $('._3YgRM,._1QEDd').each(function (i, elem) {
                        odds[i] = $(this).text();
                    });
                    $('._2trL6 div:nth-child(2)').each(function (i, elem) {
                        pointshome[i] = $(this).text();
                    });
                    $('._2trL6 div:nth-child(1)').each(function (i, elem) {
                        pointsaway[i] = $(this).text();
                    });
                    var allgames = []
                    for (var index = 0; index < teams.length; index = index + 2) {
                        var game = {
                            home: teams[index + 1],
                            visitor: teams[index],
                            oddhome: oddsConverter(odds[index * 2 + 3]),
                            oddvisitor: oddsConverter(odds[index * 2 + 2]),
                            pointshome: pointshome[index / 2],
                            pointsaway: pointsaway[index / 2],
                        }
                        allgames.push(game)
                    }
                    for (let j in allgames) {
                        let odds = {
                            ODDS_HOME: Number(allgames[j].oddhome),
                            ODDS_VISITOR: Number(allgames[j].oddvisitor)
                        }
                        updateOdds(odds, ogDates[i], allgames[j].home, allgames[j].visitor)
                    }
                });
            }, i * 10000);
        })(i);
    }
}

function updateOdds(odds, date, home, away) {
    Game.find({
        GAME_DATE_EST: date,
    }).populate("HOME_TEAM_ID VISITOR_TEAM_ID").exec().then(games => {
        var id = null
        if (home == "L.A. Lakers") {
            home = "Los Angeles"
        }
        if (away == "L.A. Lakers") {
            away = "Los Angeles"
        }
        if (home == "L.A. Clippers") {
            home = "LA"
        }
        if (away == "L.A. Clippers") {
            away = "LA"
        }
        for (var index in games) {
            if (games[index].HOME_TEAM_ID.TEAM_CITY == home && games[index].VISITOR_TEAM_ID.TEAM_CITY == away) {
                id = games[index]._id
                break
            }
        }
        odds.ODDS_HOME = Number(odds.ODDS_HOME)
        odds.ODDS_VISITOR = Number(odds.ODDS_VISITOR)
        if (typeof odds.ODDS_HOME != 'number') {
            odds.ODDS_HOME = 0
        }
        if (typeof odds.ODDS_VISITOR != 'number') {
            odds.ODDS_VISITOR = 0
        }
        Game.update({
            _id: id
        }, {
            $set: {
                ODDS_HOME: odds.ODDS_HOME,
                ODDS_VISITOR: odds.ODDS_VISITOR
            }
        }).exec().then(result => {}).catch(err => {
            console.log(err);
        })
    })
}

function convertDates(dates) {
    var newdates = []
    for (var index in dates) {
        var year = dates[index].GAME_DATE_EST.slice(0, 4)
        var month = dates[index].GAME_DATE_EST.slice(5, 7)
        var day = dates[index].GAME_DATE_EST.slice(8, 10)
        var newdate = year + month + day
        var exists = false
        for (var index2 in newdates) {
            if (newdate == newdates[index2]) {
                exists = true
                break
            }
        }
        if (exists == false) {
            newdates.push(newdate)
        }
    }
    return newdates
}

function convertDates2(dates) {
    var newdates = []
    for (var index in dates) {
        var newdate = dates[index].GAME_DATE_EST
        var exists = false
        for (var index2 in newdates) {
            if (newdate == newdates[index2]) {
                exists = true
                break
            }
        }
        if (exists == false) {
            newdates.push(newdate)
        }
    }
    return newdates
}

function returnValues(gamestotal) {
    var requestTime = 2000
    return Game.find({
        _id: {
            $in: gamestotal
        }
    }).select("_id HOME_TEAM_ID VISITOR_TEAM_ID HOME_PIE VISITOR_PIE").exec().then(games => {
        var wrongGames = []
        for (var index2 in games) {
            if (games[index2].VISITOR_PIE > 1 || games[index2].HOME_PIE > 1) {
                wrongGames.push(games[index2])
            }
        }
        console.log(wrongGames.length)
        for (let index3 = 0; index3 < wrongGames.length; index3++) {
            (function (index3) {
                setTimeout(function () {
                    percentage = (index3 + 1) / (wrongGames.length / 100)
                    percentage = Math.round(percentage, 1)
                    process.stdout.write("Games: " + percentage + " %\r");
                    updateGame(wrongGames[index3]._id)
                }, index3 * requestTime);
            })(index3);
        }
    })
}

function updateGame(id) {
    var requestID = "00" + id
    api.getBoxscore(requestID).then(data2 => {
        api.getBoxscorePlayer(requestID).then(data3 => {
            api.getBoxscoreTradicional(requestID).then(data4 => {
                api.getBoxscoreAdvanced(requestID).then(data5 => {
                    var inactives = []
                    var inactiveIDs = []
                    var playerStats = []
                    var playerStatsIds = []
                    var homePTS = []
                    var visitorPTS = []
                    var homeID
                    var visitorID
                    for (let x in data2.resultSets[3].rowSet) {
                        inactives.push(data2.resultSets[3].rowSet[x][0])
                    }
                    for (let r in data3.resultSets[0].rowSet) {
                        playerStats.push(data3.resultSets[0].rowSet[r][4])
                    }
                    for (let z = 0; z < 10; z++) {
                        homePTS.push(data2.resultSets[5].rowSet[0][z + 8])
                        visitorPTS.push(data2.resultSets[5].rowSet[1][z + 8])
                    }
                    Player.find({
                            _id: {
                                $in: inactives
                            }
                        })
                        .exec()
                        .then(players => {
                            for (var y in players) {
                                inactiveIDs.push(players[y]._id)
                            }
                        }).then(() => {
                            Player.find({
                                    _id: {
                                        $in: playerStats
                                    }
                                })
                                .exec()
                                .then(players2 => {
                                    for (var g in players2) {
                                        playerStatsIds.push(players2[g]._id)
                                    }
                                }).then(() => {
                                    Team.findOne({
                                        _id: data2.resultSets[0].rowSet[0][6]
                                    }).exec().then(team => {
                                        homeID = team._id
                                        Team.findOne({
                                            _id: data2.resultSets[0].rowSet[0][7]
                                        }).exec().then(team => {
                                            visitorID = team._id
                                            Game.findOne({
                                                _id: data2.resultSets[0].rowSet[0][2]
                                            }).exec().then(test => {
                                                var allStats = []
                                                for (var ty in data4.resultSets[0].rowSet) {
                                                    var type = ""
                                                    if (data4.resultSets[0].rowSet[ty][1] == homeID) {
                                                        type = "HOME"
                                                    }
                                                    if (data4.resultSets[0].rowSet[ty][1] == visitorID) {
                                                        type = "VISITOR"
                                                    }
                                                    var stat = {
                                                        TYPE: type,
                                                        FGM: data4.resultSets[0].rowSet[ty][9],
                                                        FGA: data4.resultSets[0].rowSet[ty][10],
                                                        FG3M: data4.resultSets[0].rowSet[ty][12],
                                                        FG3A: data4.resultSets[0].rowSet[ty][13],
                                                        FG3_PCT: data4.resultSets[0].rowSet[ty][14],
                                                        FTM: data4.resultSets[0].rowSet[ty][15],
                                                        FTA: data4.resultSets[0].rowSet[ty][16],
                                                        FT_PCT: data4.resultSets[0].rowSet[ty][17],
                                                        OREB: data4.resultSets[0].rowSet[ty][18],
                                                        DREB: data4.resultSets[0].rowSet[ty][19],
                                                        REB: data4.resultSets[0].rowSet[ty][20],
                                                        STL: data4.resultSets[0].rowSet[ty][22],
                                                        BLK: data4.resultSets[0].rowSet[ty][23],
                                                        TO: data4.resultSets[0].rowSet[ty][24],
                                                        PF: data4.resultSets[0].rowSet[ty][25],
                                                        PTS: data4.resultSets[0].rowSet[ty][26],
                                                        PLUS_MINUS: data4.resultSets[0].rowSet[ty][27],
                                                    }
                                                    for (var count in data3.resultSets[0].rowSet) {
                                                        if (data4.resultSets[0].rowSet[ty][4] == data3.resultSets[0].rowSet[count][4]) {
                                                            stat.PLAYER = data4.resultSets[0].rowSet[ty][4],
                                                            stat.COMMENT = data3.resultSets[0].rowSet[count][7]
                                                            stat.MIN = data3.resultSets[0].rowSet[count][8]
                                                            stat.SPD = data3.resultSets[0].rowSet[count][9]
                                                            stat.DIST = data3.resultSets[0].rowSet[count][10]
                                                            stat.ORBC = data3.resultSets[0].rowSet[count][11]
                                                            stat.DRBC = data3.resultSets[0].rowSet[count][12]
                                                            stat.RBC = data3.resultSets[0].rowSet[count][13]
                                                            stat.TCHS = data3.resultSets[0].rowSet[count][14]
                                                            stat.SAST = data3.resultSets[0].rowSet[count][15]
                                                            stat.FTAST = data3.resultSets[0].rowSet[count][16]
                                                            stat.PASS = data3.resultSets[0].rowSet[count][17]
                                                            stat.AST = data3.resultSets[0].rowSet[count][18]
                                                            stat.CFGM = data3.resultSets[0].rowSet[count][19]
                                                            stat.CFGA = data3.resultSets[0].rowSet[count][20]
                                                            stat.CFG_PCT = data3.resultSets[0].rowSet[count][21]
                                                            stat.UFGM = data3.resultSets[0].rowSet[count][22]
                                                            stat.UFGA = data3.resultSets[0].rowSet[count][23]
                                                            stat.UFG_PCT = data3.resultSets[0].rowSet[count][24]
                                                            stat.FG_PCT = data3.resultSets[0].rowSet[count][25]
                                                            stat.DFGM = data3.resultSets[0].rowSet[count][26]
                                                            stat.DFGA = data3.resultSets[0].rowSet[count][27]
                                                            stat.DFG_PCT = data3.resultSets[0].rowSet[count][28]
                                                        }
                                                    }
                                                    for (var count in data5.resultSets[0].rowSet) {
                                                        if (data4.resultSets[0].rowSet[ty][4] == data5.resultSets[0].rowSet[count][4]) {
                                                            stat.E_OFF_RATING = data5.resultSets[0].rowSet[count][9]
                                                            stat.OFF_RATING = data5.resultSets[0].rowSet[count][10]
                                                            stat.E_DEF_RATING = data5.resultSets[0].rowSet[count][11]
                                                            stat.DEF_RATING = data5.resultSets[0].rowSet[count][12]
                                                            stat.E_NET_RATING = data5.resultSets[0].rowSet[count][13]
                                                            stat.NET_RATING = data5.resultSets[0].rowSet[count][14]
                                                            stat.AST_PCT = data5.resultSets[0].rowSet[count][15]
                                                            stat.AST_TOV = data5.resultSets[0].rowSet[count][16]
                                                            stat.AST_RATIO = data5.resultSets[0].rowSet[count][17]
                                                            stat.OREB_PCT = data5.resultSets[0].rowSet[count][18]
                                                            stat.DREB_PCT = data5.resultSets[0].rowSet[count][19]
                                                            stat.REB_PCT = data5.resultSets[0].rowSet[count][20]
                                                            stat.TM_TOV_PCT = data5.resultSets[0].rowSet[count][21]
                                                            stat.EFG_PCT = data5.resultSets[0].rowSet[count][22]
                                                            stat.TS_PCT = data5.resultSets[0].rowSet[count][23]
                                                            stat.USG_PCT = data5.resultSets[0].rowSet[count][24]
                                                            stat.E_USG_PCT = data5.resultSets[0].rowSet[count][25]
                                                            stat.E_PACE = data5.resultSets[0].rowSet[count][26]
                                                            stat.PACE = data5.resultSets[0].rowSet[count][27]
                                                            stat.PIE = data5.resultSets[0].rowSet[count][28]
                                                        }
                                                    }
                                                    allStats.push(stat)
                                                }
                                                var totalhome = 0
                                                var totalvisitor = 0
                                                var visitorStats = 0
                                                var homeStats = 0
                                                if (data4.resultSets[1].rowSet[0][1] == homeID) {
                                                    totalhome = data4.resultSets[1].rowSet[0][23]
                                                    totalvisitor = data4.resultSets[1].rowSet[1][23]
                                                } else {
                                                    totalhome = data4.resultSets[1].rowSet[1][23]
                                                    totalvisitor = data4.resultSets[1].rowSet[0][23]
                                                }
                                                if (data5.resultSets[1].rowSet[0][1] == homeID) {
                                                    homeStats = data5.resultSets[1].rowSet[0]
                                                    visitorStats = data5.resultSets[1].rowSet[1]
                                                } else {
                                                    homeStats = data5.resultSets[1].rowSet[1]
                                                    visitorStats = data5.resultSets[1].rowSet[0]
                                                }
                                                if (test == null) {
                                                    var game = new Game({
                                                        _id: data2.resultSets[0].rowSet[0][2],
                                                        GAME_DATE_EST: data2.resultSets[0].rowSet[0][0],
                                                        TYPE: "Regular Season",
                                                        TOTAL_PTS_HOME: totalhome,
                                                        TOTAL_PTS_VISITOR: totalvisitor,
                                                        HOME_TEAM_ID: homeID,
                                                        VISITOR_TEAM_ID: visitorID,
                                                        INACTIVE_PLAYERS: inactiveIDs,
                                                        HOME_PTS: homePTS,
                                                        VISITOR_PTS: visitorPTS,
                                                        HOME_E_OFF_RATING: homeStats[6],
                                                        HOME_OFF_RATING: homeStats[7],
                                                        HOME_E_DEF_RATING: homeStats[8],
                                                        HOME_DEF_RATING: homeStats[9],
                                                        HOME_E_NET_RATING: homeStats[10],
                                                        HOME_NET_RATING: homeStats[11],
                                                        HOME_AST_PCT: homeStats[12],
                                                        HOME_AST_TOV: homeStats[13],
                                                        HOME_AST_RATIO: homeStats[14],
                                                        HOME_OREB_PCT: homeStats[15],
                                                        HOME_DREB_PCT: homeStats[16],
                                                        HOME_REB_PCT: homeStats[17],
                                                        HOME_E_TM_TOV_PCT: homeStats[18],
                                                        HOME_TM_TOV_PCT: homeStats[19],
                                                        HOME_EFG_PCT: homeStats[20],
                                                        HOME_TS_PCT: homeStats[21],
                                                        HOME_USG_PCT: homeStats[22],
                                                        HOME_E_USG_PCT: homeStats[23],
                                                        HOME_E_PACE: homeStats[24],
                                                        HOME_PACE: homeStats[25],
                                                        HOME_PIE: homeStats[26],
                                                        VISITOR_E_OFF_RATING: visitorStats[6],
                                                        VISITOR_OFF_RATING: visitorStats[7],
                                                        VISITOR_E_DEF_RATING: visitorStats[8],
                                                        VISITOR_DEF_RATING: visitorStats[9],
                                                        VISITOR_E_NET_RATING: visitorStats[10],
                                                        VISITOR_NET_RATING: visitorStats[11],
                                                        VISITOR_AST_PCT: visitorStats[12],
                                                        VISITOR_AST_TOV: visitorStats[13],
                                                        VISITOR_AST_RATIO: visitorStats[14],
                                                        VISITOR_OREB_PCT: visitorStats[15],
                                                        VISITOR_DREB_PCT: visitorStats[16],
                                                        VISITOR_REB_PCT: visitorStats[17],
                                                        VISITOR_E_TM_TOV_PCT: visitorStats[18],
                                                        VISITOR_TM_TOV_PCT: visitorStats[19],
                                                        VISITOR_EFG_PCT: visitorStats[20],
                                                        VISITOR_TS_PCT: visitorStats[21],
                                                        VISITOR_USG_PCT: visitorStats[22],
                                                        VISITOR_E_USG_PCT: visitorStats[23],
                                                        VISITOR_E_PACE: visitorStats[24],
                                                        VISITOR_PACE: visitorStats[25],
                                                        VISITOR_PIE: visitorStats[26],
                                                        PLAYER_STATS: allStats
                                                    })
                                                    game.save()
                                                        .then(result => {;
                                                        })
                                                        .catch(err => {
                                                            console.log(err);
                                                        });
                                                } else {
                                                    var game = {
                                                        GAME_DATE_EST: data2.resultSets[0].rowSet[0][0],
                                                        TYPE: "Regular Season",
                                                        TOTAL_PTS_HOME: totalhome,
                                                        TOTAL_PTS_VISITOR: totalvisitor,
                                                        HOME_TEAM_ID: homeID,
                                                        VISITOR_TEAM_ID: visitorID,
                                                        INACTIVE_PLAYERS: inactiveIDs,
                                                        HOME_PTS: homePTS,
                                                        VISITOR_PTS: visitorPTS,
                                                        HOME_E_OFF_RATING: homeStats[6],
                                                        HOME_OFF_RATING: homeStats[7],
                                                        HOME_E_DEF_RATING: homeStats[8],
                                                        HOME_DEF_RATING: homeStats[9],
                                                        HOME_E_NET_RATING: homeStats[10],
                                                        HOME_NET_RATING: homeStats[11],
                                                        HOME_AST_PCT: homeStats[12],
                                                        HOME_AST_TOV: homeStats[13],
                                                        HOME_AST_RATIO: homeStats[14],
                                                        HOME_OREB_PCT: homeStats[15],
                                                        HOME_DREB_PCT: homeStats[16],
                                                        HOME_REB_PCT: homeStats[17],
                                                        HOME_E_TM_TOV_PCT: homeStats[18],
                                                        HOME_TM_TOV_PCT: homeStats[19],
                                                        HOME_EFG_PCT: homeStats[20],
                                                        HOME_TS_PCT: homeStats[21],
                                                        HOME_USG_PCT: homeStats[22],
                                                        HOME_E_USG_PCT: homeStats[23],
                                                        HOME_E_PACE: homeStats[24],
                                                        HOME_PACE: homeStats[25],
                                                        HOME_PIE: homeStats[26],
                                                        VISITOR_E_OFF_RATING: visitorStats[6],
                                                        VISITOR_OFF_RATING: visitorStats[7],
                                                        VISITOR_E_DEF_RATING: visitorStats[8],
                                                        VISITOR_DEF_RATING: visitorStats[9],
                                                        VISITOR_E_NET_RATING: visitorStats[10],
                                                        VISITOR_NET_RATING: visitorStats[11],
                                                        VISITOR_AST_PCT: visitorStats[12],
                                                        VISITOR_AST_TOV: visitorStats[13],
                                                        VISITOR_AST_RATIO: visitorStats[14],
                                                        VISITOR_OREB_PCT: visitorStats[15],
                                                        VISITOR_DREB_PCT: visitorStats[16],
                                                        VISITOR_REB_PCT: visitorStats[17],
                                                        VISITOR_E_TM_TOV_PCT: visitorStats[18],
                                                        VISITOR_TM_TOV_PCT: visitorStats[19],
                                                        VISITOR_EFG_PCT: visitorStats[20],
                                                        VISITOR_TS_PCT: visitorStats[21],
                                                        VISITOR_USG_PCT: visitorStats[22],
                                                        VISITOR_E_USG_PCT: visitorStats[23],
                                                        VISITOR_E_PACE: visitorStats[24],
                                                        VISITOR_PACE: visitorStats[25],
                                                        VISITOR_PIE: visitorStats[26],
                                                        PLAYER_STATS: allStats
                                                    }
                                                    Game.update({
                                                            _id: data2.resultSets[0].rowSet[0][2]
                                                        }, {
                                                            $set: game
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
                                        }).catch(err => {
                                            console.log(err)
                                        });
                                    }).catch(err => {
                                        console.log(err)
                                    });
                                }).catch(err => {
                                    console.log(err)
                                });
                        }).catch(err => {
                            console.log(err)
                        });
                }).catch(err => {
                    console.log(err)
                });
            }).catch(err => {
                console.log(err)
            });
        }).catch(err => {
            console.log(err)
        });
    }).catch(err => {
        console.log(err)
    });
}

function oddsConverter(number) {
    var odd = Number(number)
    if (number < 0) {
        var newodd = 1 + 1 / (Math.abs(odd) / 100)
        return newodd.toFixed(2)
    } else {
        var newodd = ((Math.abs(odd) + 100) / 100)
        return newodd.toFixed(2)
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

function allGameDates(seasons, numbers) {
    var numberOfseasons = numbers
    var allseasons = []
    for (let jk = 0; jk < numberOfseasons; jk++) {
        var currentseason = seasons
        var season2 = Number(currentseason.slice(2))
        season2 = season2 + 1 - jk
        if (season2 < 10) {
            season2 = "0" + season2
        }
        currentseason = Number(currentseason) - jk
        currentseason = currentseason + "-" + season2
        allseasons.push(currentseason)
    }
    return Season.find({
        _id: {
            $in: allseasons
        }
    }).exec().then(data => {
        var allgames = []
        for (var index in data) {
            for (var index2 in data[index].REGULAR_GAMES) {
                if (typeof data[index].REGULAR_GAMES[index2] === 'number') {
                    allgames.push(Number(data[index].REGULAR_GAMES[index2]))
                }
            }
        }
        return allgames
    }).then(allgames => {
        return Game.find({
            _id: {
                $in: allgames
            }
        }).select("_id GAME_DATE_EST").sort({
            _id: 1
        }).exec().then(games => {
            return games
        })
    })
}


function arr_diff(a1, a2) {

    var a = [],
        diff = [];

    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }

    for (var k in a) {
        diff.push(k);
    }

    return diff;
}