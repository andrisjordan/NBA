const express = require("express");
const router = express.Router();
const AllController = require('../controllers/all');

router.get("/update", AllController.updateAll);

module.exports = router;