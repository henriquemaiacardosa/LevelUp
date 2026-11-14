const express = require('express');
const usersController = require('./users.controller');
const autenticar = require('../../middlewares/auth.middleware');

const router = express.Router();

router.put('/perfil', autenticar, usersController.atualizarPerfil);
router.get('/xp', autenticar, usersController.consultarXp);
router.put('/perfil', autenticar, usersController.obterPerfil);
router.get('/perfil', autenticar, usersController.obterPerfil);

module.exports = router;