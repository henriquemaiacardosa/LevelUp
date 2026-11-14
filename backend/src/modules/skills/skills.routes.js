const express = require('express');
const skillsController = require('./skills.controller');
const autenticar = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/demanda', autenticar, skillsController.cadastrarDemanda);
router.post('/oferta', autenticar, skillsController.cadastrarOferta);
router.get('/', autenticar, skillsController.listar);
router.delete('/:id_habilidade', autenticar, skillsController.remover);

module.exports = router;