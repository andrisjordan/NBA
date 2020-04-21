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


exports.elo = (season) => {
    Team.find({}).exec().then(teams => {
        return teams
    }).then(teams => {
        return findEloTeams(teams, season)
    }).then(data3 => {
        data3 = data3.sort(dynamicSort("Elo"))
        console.log(data3)
    })
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
        findTop5Recursive(allgames,0)
    })
}

exports.findTop5 = (id) => {
    findTop5(id)
}

function findTop5Recursive(array,index){
    if(index==array.length){
        console.log("done")
        return
    } else {
        console.log(index)
        findTop5(array[index]).then(data => {
            findTop5Recursive(array,index+1)
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