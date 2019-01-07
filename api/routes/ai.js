const express = require("express");
const router = express.Router();
const AIController = require('../controllers/ai');

router.get("/distribution", AIController.distribution);

router.get("/findTop5/:id", AIController.findTop5);

router.get("/findTop5Season/:season/:number", AIController.findTop5Season);

router.get("/findTop5SeasonMissing/:season/:number", AIController.findTop5SeasonMissing);

router.get("/elo/:season", AIController.elo);

module.exports = router;