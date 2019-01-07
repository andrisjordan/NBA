const express = require("express");
const router = express.Router();
const GameController = require('../controllers/games');

router.get("/update/:season/:number", GameController.updateAllGames);

router.get("/updatemissed", GameController.updateAllGamesMissed);

router.get("/oddsmissed", GameController.updateAllOddsMissed);

router.get("/correctgames", GameController.correctAllGames);

router.get("/odds/:season/:number", GameController.findOdds);

module.exports = router;