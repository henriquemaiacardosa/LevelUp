const express = require('express');
const disponibilidadeController = require('./disponibilidade.controller');
const autenticar = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/', autenticar, disponibilidadeController.listar);
router.put('/', autenticar, disponibilidadeController.salvar);

module.exports = router;