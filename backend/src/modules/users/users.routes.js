const express = require('express');
const usersController = require('./users.controller');
const autenticar = require('../../middlewares/auth.middleware');

const router = express.Router();

router.put('/perfil', autenticar, usersController.atualizarPerfil);

module.exports = router;