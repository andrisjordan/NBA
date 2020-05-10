const mongoose = require("mongoose");
mongoose.Promise = require('bluebird');
const Player = require("../models/player");
const Team = require('../models/team')
const Game = require('../models/game')
const Season = require('../models/season')
// require file system and jsdom
var fs = require('fs');

exports.distribution = () => {
    Team.find({}).exec().then(teams => {
        return teams
    }).then(teams => {
        var result = []
        teams.forEach(function (data) {
            result.push(findTeamStats(data._id, data.TEAM_NAME))
        })
        return Promise.all(result);
    }).then(data3 => {
        var data2 = data3.sort(dynamicSort("-WINPER"));
        var distributions = data2.map(function (distribution) {
            return distribution.Distribution
        })
        console.log(data2)
        for (var index in distributions) {
            var currentDist = distributions[index]
            console.log(data2[index].NAME)
            console.log(currentDist)
        }
    })
}


exports.last40 = () => {
    let players = {}
    let allseasons = allSeasonsInverse("2019", 10)
    return last40func(allseasons, players, 0).then(ok => {
        console.log("done")
        return ok
    })
}


exports.elo = () => {
    let elos = {}
    let allseasons = allSeasonsInverse("2019", 10)
    return eloseason(allseasons, elos, 0)
}

function eloseason(allseasons, elos, seasonInd) {
    if (seasonInd < allseasons.length) {
        return Season.find({
            _id: allseasons[seasonInd]
        }).exec().then(data => {
            var allgames = []
            for (let index3 in data) {
                for (var index2 in data[index3].REGULAR_GAMES) {
                    if (typeof data[index3].REGULAR_GAMES[index2] === 'number') {
                        allgames.push(Number(data[index3].REGULAR_GAMES[index2]))
                    }
                }
            }
            return allgames
        }).then(allgames => {
            return Game.find({
                _id: {
                    $in: allgames
                }
            }).select("_id GAME_DATE_EST_DATE TOTAL_PTS_HOME TOTAL_PTS_VISITOR HOME_TEAM_ID VISITOR_TEAM_ID").sort({
                GAME_DATE_EST_DATE: 1
            }).exec().then(games => {
                let promises = []
                for (let index = 0; index < games.length; index++) {
                    let countHome
                    let countVisitor
                    let newEloHome
                    let newEloVisitor
                    let firstVisitor = false
                    let firstHome = false
                    let HOME_TEAM_ID = games[index].HOME_TEAM_ID
                    let VISITOR_TEAM_ID = games[index].VISITOR_TEAM_ID
                    let TOTAL_PTS_HOME = games[index].TOTAL_PTS_HOME
                    let TOTAL_PTS_VISITOR = games[index].TOTAL_PTS_VISITOR
                    let beforeEloHome = TOTAL_PTS_HOME > TOTAL_PTS_VISITOR ? 400 : -400
                    let beforeEloVisitor = TOTAL_PTS_HOME < TOTAL_PTS_VISITOR ? 400 : -400
                    if (!elos[VISITOR_TEAM_ID]) {
                        newEloVisitor = 1500
                        countVisitor = 1
                        firstVisitor = true
                        elos[VISITOR_TEAM_ID] = {
                            elo: newEloVisitor,
                            count: countVisitor,
                            date: games[index].GAME_DATE_EST_DATE,
                            before: beforeEloVisitor,
                            opponent: elos[HOME_TEAM_ID] ? elos[HOME_TEAM_ID].elo : 1500
                        }
                    }
                    if (!elos[HOME_TEAM_ID]) {
                        newEloHome = 1500
                        countHome = 1
                        firstHome = true
                        elos[HOME_TEAM_ID] = {
                            elo: newEloHome,
                            count: countHome,
                            date: games[index].GAME_DATE_EST_DATE,
                            before: beforeEloHome,
                            opponent: elos[VISITOR_TEAM_ID] ? elos[VISITOR_TEAM_ID].elo : 1500
                        }
                    }
                    promises.push(Game.update({
                        _id: games[index]._id
                    }, {
                        $set: {
                            ELO_HOME: Math.round(elos[HOME_TEAM_ID].elo),
                            ELO_VISITOR: Math.round(elos[VISITOR_TEAM_ID].elo)
                        }
                    }).exec().then(ok => {
                        return ok
                    }))

                    if (firstHome == true) {
                        //nothing
                    } else if (new Date(games[index].GAME_DATE_EST_DATE).getMonth() - new Date(elos[HOME_TEAM_ID].date).getMonth() > 3) {
                        newEloHome = 1500 * 0.5 + elos[HOME_TEAM_ID].elo * 0.5
                        countHome = 10
                    } else {
                        if (elos[HOME_TEAM_ID].count < 20) {
                            countHome = elos[HOME_TEAM_ID].count + 1
                        } else {
                            countHome = elos[HOME_TEAM_ID].count
                        }
                        newEloHome = (elos[HOME_TEAM_ID].elo * ((countHome - 1) / countHome)) + ((elos[HOME_TEAM_ID].opponent + elos[HOME_TEAM_ID].before) * (1 / countHome))
                    }
                    if (firstVisitor == true) {
                        //nothing
                    } else if (new Date(games[index].GAME_DATE_EST_DATE).getMonth() - new Date(elos[VISITOR_TEAM_ID].date).getMonth() > 3) {
                        newEloVisitor = 1500 * 0.5 + elos[VISITOR_TEAM_ID].elo * 0.5
                        countVisitor = 10
                    } else {
                        if (elos[VISITOR_TEAM_ID].count < 20) {
                            countVisitor = elos[VISITOR_TEAM_ID].count + 1
                        } else {
                            countVisitor = elos[VISITOR_TEAM_ID].count
                        }
                        newEloVisitor = (elos[VISITOR_TEAM_ID].elo * ((countVisitor - 1) / countVisitor)) + ((elos[VISITOR_TEAM_ID].opponent + elos[VISITOR_TEAM_ID].before) * (1 / countVisitor))
                    }
                    elos[HOME_TEAM_ID] = {
                        elo: newEloHome,
                        count: countHome,
                        date: games[index].GAME_DATE_EST_DATE,
                        before: beforeEloHome,
                        opponent: elos[VISITOR_TEAM_ID].elo
                    }
                    elos[VISITOR_TEAM_ID] = {
                        elo: newEloVisitor,
                        count: countVisitor,
                        date: games[index].GAME_DATE_EST_DATE,
                        before: beforeEloVisitor,
                        opponent: elos[HOME_TEAM_ID].elo
                    }
                }
                return Promise.all(promises).then(done => {
                    return eloseason(allseasons, elos, seasonInd + 1)
                })
            })
        })
    } else {
        return
    }
}


function last40func(allseasons, players, seasonInd) {
    if (seasonInd < allseasons.length) {
        console.log(allseasons[seasonInd])
        return Season.find({
            _id: allseasons[seasonInd]
        }).exec().then(data => {
            var allgames = []
            for (let index3 in data) {
                for (var index2 in data[index3].REGULAR_GAMES) {
                    if (typeof data[index3].REGULAR_GAMES[index2] === 'number') {
                        allgames.push(Number(data[index3].REGULAR_GAMES[index2]))
                    }
                }
            }
            return allgames
        }).then(allgames => {
            return Game.find({
                _id: {
                    $in: allgames
                }
            }).select("_id PLAYER_STATS INACTIVE_PLAYERS").sort({
                GAME_DATE_EST_DATE: 1
            }).exec().then(games => {
                let promises = []
                for (let index = 0; index < games.length; index++) {
                    let currentPlayerArr = games[index].PLAYER_STATS
                    for (let playerIndIN = 0; playerIndIN < games[index].INACTIVE_PLAYERS.length; playerIndIN++) {
                        let PLAYER_ID = games[index].INACTIVE_PLAYERS[playerIndIN]
                        if (!players[PLAYER_ID]) {
                            players[PLAYER_ID] = {
                                nextValue: 0,
                                arr: []
                            }
                        } else {
                            if (players[PLAYER_ID].arr.length == 40) {
                                players[PLAYER_ID].arr.splice(0,1)
                            } 
                            players[PLAYER_ID].arr.push(players[PLAYER_ID].nextValue)
                            players[PLAYER_ID].nextValue = 0
                        }
                    }
                    for (let playerInd = 0; playerInd < currentPlayerArr.length; playerInd++) {
                        let last40arr
                        let PLAYER_ID = currentPlayerArr[playerInd].PLAYER
                        if (!players[PLAYER_ID]) {
                            players[PLAYER_ID] = {
                                nextValue: currentPlayerArr[playerInd].PIE,
                                arr: []
                            }
                        } else {
                            if (players[PLAYER_ID].arr.length == 40) {
                                players[PLAYER_ID].arr.splice(0,1)
                            } 
                            players[PLAYER_ID].arr.push(players[PLAYER_ID].nextValue)
                            players[PLAYER_ID].nextValue = currentPlayerArr[playerInd].PIE
                        }
                        last40arr = players[PLAYER_ID].arr
                        currentPlayerArr[playerInd].LAST40 = last40arr
                        if(currentPlayerArr[playerInd].PLAYER == 2544){
                            console.log(currentPlayerArr[playerInd].LAST40)
                        }
                    }
                    promises.push(Game.updateOne({
                        _id: games[index]._id,
                    }, {
                        $set: {
                            PLAYER_STATS: currentPlayerArr,
                        }
                    }).exec().then(ok => {
                        return ok
                    }))
                }
                return Promise.all(promises).then(done => {
                    return last40func(allseasons, players, seasonInd + 1)
                })
            })
        })
    } else {
        return
    }
}

exports.findTop5Season = (season, number) => {
    var allseasons = allSeasons(season, number)
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
        for (let index = 0; index < allgames.length; index++) {
            (function (index) {
                setTimeout(function () {
                    console.log(index)
                    findTop5(allgames[index])
                }, index * 15000);
            })(index);
        }
    })
}


exports.findTop5SeasonMissing = (season, number) => {
    var allseasons = allSeasons("2019", 10)
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
        }).select("_id TOP_HOME TOP_VISITOR").exec().then(allrecorded => {
            var difference = []
            for (var index in allrecorded) {
                if (allrecorded[index].TOP_HOME[0] == null || allrecorded[index].TOP_HOME[0] == undefined || allrecorded[index].TOP_VISITOR[0] == null || allrecorded[index].TOP_VISITOR[0] == undefined) {
                    difference.push(Number(allrecorded[index]._id))
                }
            }
            console.log(difference.length)
            return difference
        })
    }).then(allgames => {
        findTop5Recursive(allgames, 0)
    })
}

exports.findTop5 = (id) => {
    findTop5(id)
}

function findTop5Recursive(array, index) {
    if (index == array.length) {
        console.log("done")
        return
    } else {
        console.log(index)
        findTop5(array[index]).then(data => {
            findTop5Recursive(array, index + 1)
        })
    }
}

function findTop5(id) {
    return findPlayerStatsForGame(id).then(data3 => {
        data3 = data3.sort(dynamicSort("-MINWEIGHT"))
        visitorCount = 0
        homeCount = 0
        homeTop5 = []
        visitorTop5 = []
        for (var index in data3) {
            if (data3[index].Type == "HOME" && homeCount < 15) {
                var player = {
                    ID: data3[index].ID._id,
                    PIEWEIGHT: (data3[index].PIEWEIGHT * 100).toFixed(0),
                    PIEALL: (data3[index].PIEALL * 100).toFixed(0),
                    PIEPLAYED: (data3[index].PIEPLAYED * 100).toFixed(0),
                    MINWEIGHT: (data3[index].MINWEIGHT).toFixed(0),
                    MINALL: (data3[index].MINALL).toFixed(0),
                    MINPLAYED: (data3[index].MINPLAYED).toFixed(0),
                }
                homeTop5.push(player)
                homeCount++
            }
            if (data3[index].Type == "VISITOR" && visitorCount < 15) {
                var player = {
                    ID: data3[index].ID._id,
                    PIEWEIGHT: (data3[index].PIEWEIGHT * 100).toFixed(0),
                    PIEALL: (data3[index].PIEALL * 100).toFixed(0),
                    PIEPLAYED: (data3[index].PIEPLAYED * 100).toFixed(0),
                    MINWEIGHT: (data3[index].MINWEIGHT).toFixed(0),
                    MINALL: (data3[index].MINALL).toFixed(0),
                    MINPLAYED: (data3[index].MINPLAYED).toFixed(0),
                }
                visitorTop5.push(player)
                visitorCount++
            }
        }
        var top = {
            TOP_HOME: homeTop5,
            TOP_VISITOR: visitorTop5
        }
        return Game.update({
                _id: id
            }, {
                $set: top
            }).then(result => {
                return result
            })
            .catch(err => {
                console.log(err);
            });
    })
}

function findEloTeams(teams, season) {
    var allseasons = allSeasons(season, 1)
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
            },
        }).select("_id TOTAL_PTS_HOME TOTAL_PTS_VISITOR HOME_TEAM_ID VISITOR_TEAM_ID").exec().then(teamgames => {
            teamgames = teamgames.sort(dynamicSort("_id"))
            var elos = []
            var elostart = [1500]
            var elostart2 = [1500]
            for (var index in teams) {
                var curr = {
                    Name: teams[index].TEAM_NAME,
                    ID: teams[index]._id,
                    Elo: [1500],
                    Gamecount: 1,
                    Elosum: [1500]
                }
                elos.push(curr)
            }
            for (var index in teamgames) {
                var elohome = 0
                var eloaway = 0
                for (var index2 in elos) {
                    if (elos[index2].ID === teamgames[index].HOME_TEAM_ID) {
                        var count = elos[index2].Gamecount - 1
                        elohome = elos[index2].Elo[count]
                    } else if (elos[index2].ID === teamgames[index].VISITOR_TEAM_ID) {
                        var count = elos[index2].Gamecount - 1
                        eloaway = elos[index2].Elo[count]
                    }
                }
                for (var index3 in elos) {
                    var count2 = elos[index3].Gamecount
                    if (elos[index3].ID === teamgames[index].HOME_TEAM_ID) {
                        if (teamgames[index].TOTAL_PTS_HOME > teamgames[index].TOTAL_PTS_VISITOR) {
                            var value = Number(eloaway) + 400
                            elos[index3].Elosum[count2] = value
                        } else {
                            var value = Number(eloaway) - 400
                            elos[index3].Elosum[count2] = value
                        }
                        var array = elos[index3].Elosum
                        var elosums = sumArray(array, elos[index3].Gamecount)
                        if (elos[index3].Gamecount < 20) {
                            elos[index3].Elo[elos[index3].Gamecount] = Math.round((elosums / (elos[index3].Gamecount)))
                        } else {
                            elos[index3].Elo[elos[index3].Gamecount] = Math.round((elosums / 20))
                        }
                        elos[index3].Gamecount++
                    } else if (elos[index3].ID === teamgames[index].VISITOR_TEAM_ID) {
                        if (teamgames[index].TOTAL_PTS_HOME < teamgames[index].TOTAL_PTS_VISITOR) {
                            var value = Number(elohome) + 400
                            elos[index3].Elosum[count2] = value
                        } else {
                            var value = Number(elohome) - 400
                            elos[index3].Elosum[count2] = value
                        }
                        var array = elos[index3].Elosum
                        var elosums = sumArray(array, elos[index3].Gamecount)
                        if (elos[index3].Gamecount < 20) {
                            elos[index3].Elo[elos[index3].Gamecount] = Math.round((elosums / (elos[index3].Gamecount)))
                        } else {
                            elos[index3].Elo[elos[index3].Gamecount] = Math.round((elosums / 20))
                        }
                        elos[index3].Gamecount++
                    }
                }
            }
            return elos
        })
    })
}

function sumArray(array, index) {
    var sum = 0
    if (index < 20) {
        for (var index2 = index - 1; index2 >= 0; index2--) {
            sum = sum + array[index2]
        }
    } else {
        for (var index2 = index - 1; index2 >= index - 20; index2--) {
            sum = sum + array[index2]
        }
    }

    return sum
}

function findPlayerStatsForGame(id) {
    return Game.findOne({
        _id: id
    }).select("INACTIVE_PLAYERS PLAYER_STATS GAME_DATE_EST").exec().then(game => {
        var year = Number(game.GAME_DATE_EST.slice(0, 4))
        var month = Number(game.GAME_DATE_EST.slice(5, 7))
        if (month < 8) {
            year = year - 1
        }
        year = year.toString()
        var result = []
        let stats = game.PLAYER_STATS
        stats.forEach(function (data) {
            let playerid = data.PLAYER
            let type = data.TYPE
            result.push(findPlayerDataforGame(playerid, id, year, type))
        })
        return Promise.all(result)
    })
}

function findPlayerDataforGame(id, gameid, season, type) {
    var allseasons = allSeasons(season, 2)
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
            },
            $or: [{
                    "PLAYER_STATS.PLAYER": id
                },
                {
                    INACTIVE_PLAYERS: id
                }
            ]
        }).select("_id PLAYER_STATS INACTIVE_PLAYERS").sort({
            _id: 1
        }).exec().then(games => {
            return Player.findById(id).exec().then(currentplayer => {
                if (games != null) {
                    games = games.sort(dynamicSort("-_id"))
                    var minuteSum = 0
                    var minuteSumPlayed = 0
                    var allgamecount = games.length
                    var playedcount = 0
                    var orig = 10
                    var pieSum = 0
                    var pieSumPlayed = 0
                    var startindex = 0
                    for (var i in games) {
                        if (games[i]._id == gameid) {
                            startindex = Number(i) + 1
                        }
                    }
                    var numberofgames = 20 + startindex + 1
                    if (numberofgames > games.length) {
                        numberofgames = games.length
                    }
                    for (var index2 = startindex; index2 < numberofgames; index2++) {
                        for (var index4 in games[index2].INACTIVE_PLAYERS) {
                            if (games[index2].INACTIVE_PLAYERS[index4] === id) {
                                minuteSum = minuteSum + 0
                            }
                        }
                        for (var index3 in games[index2].PLAYER_STATS) {
                            if (games[index2].PLAYER_STATS[index3].PLAYER === id) {
                                var min = Number(games[index2].PLAYER_STATS[index3].MIN.slice(0, 2))
                                var pie = games[index2].PLAYER_STATS[index3].PIE
                                if (typeof pie != 'number') {
                                    pie = 0
                                }
                                if (min > 0 && min < 1000) {
                                    playedcount++
                                    minuteSum = minuteSum + min
                                    pieSum = pieSum + pie
                                }
                            }
                        }
                    }
                    minuteSumPlayed = minuteSum
                    pieSumPlayed = pieSum
                    if (numberofgames < games.length) {
                        var index5 = numberofgames
                        while (playedcount < orig && playedcount < games.length && index5 < games.length) {
                            for (var index7 in games[index5].INACTIVE_PLAYERS) {
                                if (games[index5] != null || games[index5] != undefined) {
                                    if (games[index5].INACTIVE_PLAYERS[index7] === id) {
                                        index5++
                                    }
                                }
                            }
                            if (games[index5] != null || games[index5] != undefined) {
                                for (var index6 in games[index5].PLAYER_STATS) {
                                    if (games[index5] != null || games[index5] != undefined) {
                                        if (games[index5].PLAYER_STATS[index6].PLAYER === id) {
                                            var min = Number(games[index5].PLAYER_STATS[index6].MIN.slice(0, 2))
                                            var pie = games[index5].PLAYER_STATS[index6].PIE
                                            if (typeof pie != 'number') {
                                                pie = 0
                                            }
                                            if (min > 0 && min < 1000) {
                                                playedcount++
                                                minuteSumPlayed = minuteSumPlayed + min
                                                pieSumPlayed = pieSumPlayed + games[index5].PLAYER_STATS[index6].PIE
                                            }
                                        }
                                    }
                                }
                            }
                            index5++
                        }
                    }
                    var all = numberofgames - startindex
                    if (playedcount > 0) {
                        var player = {
                            ID: currentplayer,
                            Type: type,
                            MINALL: minuteSum / all,
                            MINPLAYED: minuteSumPlayed / playedcount,
                            MINWEIGHT: minuteSum / all * 0.5 + minuteSumPlayed / playedcount * 0.5,
                            PIEALL: pieSum / all,
                            PIEPLAYED: pieSumPlayed / playedcount,
                            PIEWEIGHT: pieSum / all * 0.5 + pieSumPlayed / playedcount * 0.5,
                        }
                    } else {
                        var player = {
                            ID: currentplayer,
                            Type: type,
                            MINALL: 0,
                            MINPLAYED: 0,
                            MINWEIGHT: 0,
                            PIEALL: 0,
                            PIEPLAYED: 0,
                            PIEWEIGHT: 0,
                        }
                    }
                    return player
                } else {
                    var player = {
                        ID: currentplayer,
                        Type: type,
                        MINALL: 0,
                        MINPLAYED: 0,
                        MINWEIGHT: 0,
                        PIEALL: 0,
                        PIEPLAYED: 0,
                        PIEWEIGHT: 0,
                    }
                    return player
                }
            })
        })
    })
}

function findPlayerStats(id, name) {
    var allseasons = allSeasons("2018", 5)
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
            },
            "PLAYER_STATS.PLAYER": id
        }).select("_id PLAYER_STATS").sort({
            _id: 1
        }).exec().then(games => {
            var pieSum = 0
            var allgamecount = games.length
            var distribution = []
            for (var index2 in games) {
                for (var index3 in games[index2].PLAYER_STATS) {
                    if (games[index2].PLAYER_STATS[index3].PLAYER == id) {
                        pieSum = pieSum + games[index2].PLAYER_STATS[index3].PIE
                        var exits = false
                        var currentPIE = (games[index2].PLAYER_STATS[index3].PIE * 100).toFixed(0)
                        var currentDist = {
                            PIE: Number(currentPIE),
                            Number: 1
                        }
                        for (var i in distribution) {
                            if (distribution[i].PIE == currentPIE) {
                                distribution[i].Number = distribution[i].Number + 1
                                exits = true
                            }
                        }
                        if (!exits) {
                            distribution.push(currentDist)
                        }
                    }
                }
            }
            var player = {
                ID: id,
                NAME: name,
                Games: allgamecount,
                PIE: pieSum / allgamecount,
                Distribution: sortObj(distribution, "PIE")
            }
            return player
        })
    })
}

function findTeamStats(id, name) {
    var allseasons = allSeasons("2018", 10)
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
        }).select("_id HOME_TEAM_ID VISITOR_TEAM_ID HOME_PIE VISITOR_PIE TOTAL_PTS_HOME TOTAL_PTS_VISITOR").sort({
            _id: 1
        }).exec().then(games => {
            var pieSum = 0
            var count2 = 0
            var allgamecount = 0
            var distribution = []
            for (var index2 in games) {
                if (id === games[index2].HOME_TEAM_ID) {
                    pieSum = pieSum + games[index2].HOME_PIE
                    var exits = false
                    var currentPIE = (games[index2].HOME_PIE * 100).toFixed(0)
                    var currentDist = {
                        PIE: Number(currentPIE),
                        Number: 1
                    }
                    for (var i in distribution) {
                        if (distribution[i].PIE == currentPIE) {
                            distribution[i].Number = distribution[i].Number + 1
                            exits = true
                        }
                    }
                    if (!exits) {
                        distribution.push(currentDist)
                    }
                    if (Number(games[index2].TOTAL_PTS_HOME) > Number(games[index2].TOTAL_PTS_VISITOR)) {
                        count2++
                    }
                    allgamecount++
                } else if (id === games[index2].VISITOR_TEAM_ID) {
                    pieSum = pieSum + games[index2].VISITOR_PIE
                    var exits = false
                    var currentPIE = (games[index2].VISITOR_PIE * 100).toFixed(0)
                    var currentDist = {
                        PIE: currentPIE,
                        Number: 1
                    }
                    for (var i in distribution) {
                        if (distribution[i].PIE == currentPIE) {
                            distribution[i].Number = distribution[i].Number + 1
                            exits = true
                        }
                    }
                    if (!exits) {
                        distribution.push(currentDist)
                    }
                    if (Number(games[index2].TOTAL_PTS_HOME) < Number(games[index2].TOTAL_PTS_VISITOR)) {
                        count2++
                    }
                    allgamecount++
                }
            }
            var team = {
                ID: id,
                NAME: name,
                Games: allgamecount,
                PIE: pieSum / allgamecount,
                WINPER: count2 / allgamecount,
                Distribution: sortObj(distribution, "PIE")
            }
            return team
        })
    })
}

function getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
}

function sortObj(list, key) {
    function compare(a, b) {
        a = a[key];
        b = b[key];
        var type = (typeof (a) === 'string' ||
            typeof (b) === 'string') ? 'string' : 'number';
        var result;
        if (type === 'string') result = a.localeCompare(b);
        else result = a - b;
        return result;
    }
    return list.sort(compare);
}

function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function allSeasons(season, number) {
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

function allSeasonsInverse(season, number) {
    var numberOfseasons = number
    var allseasons = []
    for (let jk = numberOfseasons; jk >= 0; jk--) {
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