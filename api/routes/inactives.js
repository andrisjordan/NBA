const express = require("express");
const router = express.Router();
const InactiveController = require('../controllers/inactives');

router.get("/update", InactiveController.updateInactives);

module.exports = router;