const { Router } = require('express');
const { autenticar } = require('../../middlewares/auth.middleware');
const matchmakingController = require('./matchmaking.controller');

const router = Router();

router.get('/', autenticar, matchmakingController.buscar);

module.exports = router;