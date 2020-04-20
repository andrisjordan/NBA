const axios = require('axios');
var Table = require('cli-table');

class Parameter {
    constructor(type, value) {
        this.type = type
        this.value = value
    }
}

var url = "https://stats.nba.com/stats/"
var LeagueID = new Parameter("LeagueID", "00")
var IsOnlyCurrentSeason = new Parameter("IsOnlyCurrentSeason", "0")
var DayOffset = new Parameter("DayOffset", "0")
var RangeType = new Parameter("RangeType", "2")
var StartRange = new Parameter("StartRange", "0")
var EndRange = new Parameter("EndRange", "1000000")
var StartPeriod = new Parameter("StartPeriod", "1")
var EndPeriod = new Parameter("EndPeriod", "10")
var PerMode = new Parameter("PerMode", "PerGame")

exports.getAllPlayers = function (season) {
    var endpoint = "commonallplayers"
    var Season = new Parameter("Season", season)
    var params = [url, endpoint, LeagueID, Season, IsOnlyCurrentSeason]
    var finalstring = combinestring(params)
    return axios({
        method: "get",
        url: finalstring,
        headers: {
            'Host': 'stats.nba.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'x-nba-stats-origin': 'stats',
            'x-nba-stats-token': 'true',
            'Connection': 'keep-alive',
            'Referer': 'https://stats.nba.com/',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
        }
    }).then(response => {
        // returning the data here allows the caller to get it through another .then(...)
        return response.data
    }).catch(err => {
        console.log(err)
    });
}

exports.getPlayerInfo = function (playerid) {
    var endpoint = "commonplayerinfo"
    var PlayerID = new Parameter("PlayerID", playerid)
    var params = [url, endpoint, PlayerID]
    var finalstring = combinestring(params)

    return axios({
        method: "get",
        url: finalstring,
        headers: {
            'Host': 'stats.nba.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'x-nba-stats-origin': 'stats',
            'x-nba-stats-token': 'true',
            'Connection': 'keep-alive',
            'Referer': 'https://stats.nba.com/',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
        }
    }).then(response => {
        // returning the data here allows the caller to get it through another .then(...)
        return response.data
    }).catch(err => {
        console.log(err)
    });
}

exports.getPlayerProfile = function (playerid) {
    var endpoint = "playerprofilev2"
    var PlayerID = new Parameter("PlayerID", playerid)
    var params = [url, endpoint, PlayerID, PerMode]
    var finalstring = combinestring(params)

    return axios({
        method: "get",
        url: finalstring,
        headers: {
            'Host': 'stats.nba.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'x-nba-stats-origin': 'stats',
            'x-nba-stats-token': 'true',
            'Connection': 'keep-alive',
            'Referer': 'https://stats.nba.com/',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
        }
    }).then(response => {
        // returning the data here allows the caller to get it through another .then(...)
        return response.data
    }).catch(err => {
        console.log(err)
    });
}

exports.getPlayerProfile2 = function (playerid, season, seasontype, stat) {
    var endpoint = "playerprofile"
    var PlayerID = new Parameter("PlayerID", playerid)
    var Season = new Parameter("Season", season)
    var GraphStartSeason = new Parameter("GraphStartSeason", season)
    var GraphEndSeason = new Parameter("GraphEndSeason", season)
    var GraphStat = new Parameter("GraphStat", stat)
    var SeasonType = new Parameter("SeasonType", seasontype)
    var params = [url, endpoint, PlayerID, LeagueID, Season, GraphStartSeason, GraphEndSeason, GraphStat, SeasonType]
    var finalstring = combinestring(params)

    return axios({
        method: "get",
        url: finalstring,
        headers: {
            'Host': 'stats.nba.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'x-nba-stats-origin': 'stats',
            'x-nba-stats-token': 'true',
            'Connection': 'keep-alive',
            'Referer': 'https://stats.nba.com/',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
        }
    }).then(response => {
        // returning the data here allows the caller to get it through another .then(...)
        return response.data
    }).catch(err => {
        console.log(err)
    });
}

exports.getBoxscore = function (gameid) {
    var endpoint = "boxscoresummaryv2"
    var GameID = new Parameter("GameID", gameid)
    var params = [url, endpoint, GameID]
    var finalstring = combinestring(params)



    return axios({
        method: "get",
        url: finalstring,
        headers: {
            'Host': 'stats.nba.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'x-nba-stats-origin': 'stats',
            'x-nba-stats-token': 'true',
            'Connection': 'keep-alive',
            'Referer': 'https://stats.nba.com/',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
        }
    }).then(response => {
        // returning the data here allows the caller to get it through another .then(...)
        return response.data
    }).catch(err => {
        console.log(err)
    });
}

exports.getBoxscoreTradicional = function (gameid) {
    var endpoint = "boxscoretraditionalv2"
    var GameID = new Parameter("GameID", gameid)
    var params = [url, endpoint, GameID, RangeType, StartRange, EndRange, StartPeriod, EndPeriod]
    var finalstring = combinestring(params)



    return axios({
        method: "get",
        url: finalstring,
        headers: {
            'Host': 'stats.nba.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'x-nba-stats-origin': 'stats',
            'x-nba-stats-token': 'true',
            'Connection': 'keep-alive',
            'Referer': 'https://stats.nba.com/',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
        }
    }).then(response => {
        // returning the data here allows the caller to get it through another .then(...)
        return response.data
    }).catch(err => {
        console.log(err)
    });
}

exports.getBoxscoreAdvanced = function (gameid) {
    var endpoint = "boxscoreadvancedv2"
    var GameID = new Parameter("GameID", gameid)
    var params = [url, endpoint, GameID, RangeType, StartRange, EndRange, StartPeriod, EndPeriod]
    var finalstring = combinestring(params)



    return axios({
        method: "get",
        url: finalstring,
        headers: {
            'Host': 'stats.nba.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'x-nba-stats-origin': 'stats',
            'x-nba-stats-token': 'true',
            'Connection': 'keep-alive',
            'Referer': 'https://stats.nba.com/',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
        }
    }).then(response => {
        // returning the data here allows the caller to get it through another .then(...)
        return response.data
    }).catch(err => {
        console.log(err)
    });
}

exports.getBoxscorePlayer = function (gameid) {
    var endpoint = "boxscoreplayertrackv2"
    var GameID = new Parameter("GameID", gameid)
    var params = [url, endpoint, GameID]
    var finalstring = combinestring(params)



    return axios({
        method: "get",
        url: finalstring,
        headers: {
            'Host': 'stats.nba.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'x-nba-stats-origin': 'stats',
            'x-nba-stats-token': 'true',
            'Connection': 'keep-alive',
            'Referer': 'https://stats.nba.com/',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
        }
    }).then(response => {
        // returning the data here allows the caller to get it through another .then(...)
        return response.data
    }).catch(err => {
        console.log(err)
    });
}

exports.getScoreBoard = function (gamedate, offset) {
    var endpoint = "scoreboardV2"
    var GameDate = new Parameter("GameDate", gamedate)
    var DayOffset = new Parameter("DayOffset", offset)
    var params = [url, endpoint, LeagueID, GameDate, DayOffset]
    var finalstring = combinestring(params)



    return axios({
        method: "get",
        url: finalstring,
        headers: {
            'Host': 'stats.nba.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'x-nba-stats-origin': 'stats',
            'x-nba-stats-token': 'true',
            'Connection': 'keep-alive',
            'Referer': 'https://stats.nba.com/',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
        }
    }).then(response => {
        // returning the data here allows the caller to get it through another .then(...)
        return response.data
    }).catch(err => {
        console.log(err)
    });
}

exports.getTeamInfo = function (teamid, season, seasontype) {
    var endpoint = "teaminfocommon"
    var TeamID = new Parameter("TeamID", teamid)
    var Season = new Parameter("Season", season)
    var SeasonType = new Parameter("SeasonType", seasontype)
    var params = [url, endpoint, TeamID, Season, SeasonType, LeagueID]
    var finalstring = combinestring(params)



    return axios({
        method: "get",
        url: finalstring,
        headers: {
            'Host': 'stats.nba.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'x-nba-stats-origin': 'stats',
            'x-nba-stats-token': 'true',
            'Connection': 'keep-alive',
            'Referer': 'https://stats.nba.com/',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
        }
    }).then(response => {
        // returning the data here allows the caller to get it through another .then(...)
        return response.data
    }).catch(err => {
        console.log(err)
    });
}

exports.getAllTeams = function () {
    var endpoint = "commonTeamYears"
    var params = [url, endpoint, LeagueID]
    var finalstring = combinestring(params)



    return axios({
        method: "get",
        url: finalstring,
        headers: {
            'Host': 'stats.nba.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'x-nba-stats-origin': 'stats',
            'x-nba-stats-token': 'true',
            'Connection': 'keep-alive',
            'Referer': 'https://stats.nba.com/',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
        }
    }).then(response => {
        // returning the data here allows the caller to get it through another .then(...)
        return response.data
    }).catch(err => {
        console.log(err)
    });
}

exports.getTeamRoster = function (teamid, season) {
    var endpoint = "commonteamroster"
    var TeamID = new Parameter("TeamID", teamid)
    var Season = new Parameter("Season", season)
    var params = [url, endpoint, TeamID, Season]
    var finalstring = combinestring(params)



    return axios({
        method: "get",
        url: finalstring,
        headers: {
            'Host': 'stats.nba.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'x-nba-stats-origin': 'stats',
            'x-nba-stats-token': 'true',
            'Connection': 'keep-alive',
            'Referer': 'https://stats.nba.com/',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
        }
    }).then(response => {
        // returning the data here allows the caller to get it through another .then(...)
        return response.data
    }).catch(err => {
        console.log(err)
    });
}

exports.getTeamGameLog = function (teamid, season, seasontype) {
    var endpoint = "teamgamelog"
    var TeamID = new Parameter("TeamID", teamid)
    var Season = new Parameter("Season", season)
    var SeasonType = new Parameter("SeasonType", seasontype)
    var params = [url, endpoint, TeamID, Season, SeasonType]
    var finalstring = combinestring(params)


    return axios({
        method: "get",
        url: finalstring,
        headers: {
            'Host': 'stats.nba.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'x-nba-stats-origin': 'stats',
            'x-nba-stats-token': 'true',
            'Connection': 'keep-alive',
            'Referer': 'https://stats.nba.com/',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
        }
    }).then(response => {
        // returning the data here allows the caller to get it through another .then(...)
        return response.data
    }).catch(err => {
        console.log(err)
    });
}


exports.getPlayerCarrerStats = function (playerid) {
    var endpoint = "playercareerstats"
    var PlayerID = new Parameter("PlayerID", playerid)
    var params = [url, endpoint, PlayerID, PerMode]
    var finalstring = combinestring(params)



    return axios({
        method: "get",
        url: finalstring,
        headers: {
            'Host': 'stats.nba.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'x-nba-stats-origin': 'stats',
            'x-nba-stats-token': 'true',
            'Connection': 'keep-alive',
            'Referer': 'https://stats.nba.com/',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
        }
    }).then(response => {
        // returning the data here allows the caller to get it through another .then(...)
        return response.data
    }).catch(err => {
        console.log(err)
    });
}

exports.getPlayerGameLog = function (playerid, season, seasontype) {
    var endpoint = "playergamelog"
    var PlayerID = new Parameter("PlayerID", playerid)
    var Season = new Parameter("Season", season)
    var SeasonType = new Parameter("SeasonType", seasontype)
    var params = [url, endpoint, PlayerID, Season, SeasonType]
    var finalstring = combinestring(params)



    return axios({
        method: "get",
        url: finalstring,
        headers: {
            'Host': 'stats.nba.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'x-nba-stats-origin': 'stats',
            'x-nba-stats-token': 'true',
            'Connection': 'keep-alive',
            'Referer': 'https://stats.nba.com/',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
        }
    }).then(response => {
        // returning the data here allows the caller to get it through another .then(...)
        return response.data
    }).catch(err => {
        console.log(err)
    });
}
exports.showTable = function (data) {
    for (var index in data.resultSets) {
        var colWidths = []
        for (var index3 in data.resultSets[index].headers) {
            colWidths[index3] = 8
        }
        var table = new Table({
            head: data.resultSets[index].headers,
            chars: {
                'top': '═',
                'top-mid': '╤',
                'top-left': '╔',
                'top-right': '╗',
                'bottom': '═',
                'bottom-mid': '╧',
                'bottom-left': '╚',
                'bottom-right': '╝',
                'left': '║',
                'left-mid': '╟',
                'mid': '─',
                'mid-mid': '┼',
                'right': '║',
                'right-mid': '╢',
                'middle': '│'
            },
            style: {
                head: ['bgGreen']
            },
        });
        for (var index2 in data.resultSets[index].rowSet) {
            for (var index4 in data.resultSets[index].rowSet[index2]) {
                if (data.resultSets[index].rowSet[index2][index4] == null) {
                    data.resultSets[index].rowSet[index2][index4] = 0
                }
            }
            table.push(data.resultSets[index].rowSet[index2]);
        }
        if (data.resultSets[index].name != "AvailableSeasons") {
            console.log(data.resultSets[index].name)
            console.log(table.toString());
        }
    }
}

function combinestring(params) {
    var finalstring = ""
    for (var index in params) {
        if (index == 0) {
            finalstring = finalstring + params[index].toString()
        } else if (index == 1) {
            finalstring = finalstring + params[index].toString() + "/"
        } else if (index == 2) {
            finalstring = finalstring + "?" + params[index].type.toString()
            finalstring = finalstring + "=" + params[index].value.toString()
        } else {
            finalstring = finalstring + "&" + params[index].type.toString()
            finalstring = finalstring + "=" + params[index].value.toString()
        }
    }
    return finalstring
}

function status(response) {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
    } else {
        return Promise.reject(new Error(response.statusText))
    }
}