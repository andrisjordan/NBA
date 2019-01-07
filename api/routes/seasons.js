const express = require("express");
const router = express.Router();
const SeasonController = require('../controllers/seasons');

router.get("/update/:season/:number", SeasonController.updateSeason);

module.exports = router;