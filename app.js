const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//Routes
const playerRoutes = require('./api/routes/players');
const teamRoutes = require('./api/routes/teams');
const gameRoutes = require('./api/routes/games');
const seasonRoutes = require('./api/routes/seasons')
const aiRoutes = require('./api/routes/ai')
const inactiveRoutes = require('./api/routes/inactives')
const allRoutes = require('./api/routes/all')

mongoose.connect('mongodb://localhost:27017/NBA');
mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Routes which should handle requests
app.use("/players", playerRoutes);
app.use("/teams", teamRoutes);
app.use("/games", gameRoutes);
app.use("/seasons", seasonRoutes);
app.use("/ai", aiRoutes)
app.use("/inactives", inactiveRoutes)
app.use("/all", allRoutes)

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;