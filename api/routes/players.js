const express = require("express");
const router = express.Router();
const PlayerController = require('../controllers/players');

router.get("/update", PlayerController.updateAllPlayers);

module.exports = router;