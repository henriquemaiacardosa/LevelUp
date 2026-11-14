const express = require('express');
const autenticar = require('../../middlewares/auth.middleware');
const leaderboardController = require('./leaderboard.controller');

const router = express.Router();

router.get('/', autenticar, leaderboardController.obter);

module.exports = router;