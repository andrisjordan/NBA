const mongoose = require("mongoose");
const Player = require("./api/models/player");
const Team = require('./api/models/team')
const Game = require('./api/models/game')
const Season = require('./api/models/season')
const api = require('./api')
const request = require('request');
const cheerio = require('cheerio');
mongoose.Promise = require('bluebird');

var string = "J.r."

var newstring = string.split('.').join("").toUpperCase();

console.log(string)
console.log(newstring)