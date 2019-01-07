const express = require("express");
const router = express.Router();
const TeamController = require('../controllers/teams');

router.get("/update/:season/:number", TeamController.updateAllTeams);

module.exports = router;