const express = require('express');
const autenticar = require('../../middlewares/auth.middleware');
const disciplinasController = require('./disciplinas.controller');

const router = express.Router();

router.get('/', autenticar, disciplinasController.listar);

module.exports = router;