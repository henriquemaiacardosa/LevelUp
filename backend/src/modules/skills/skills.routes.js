const express = require('express');
const skillsController = require('./skills.controller');
const autenticar = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/demanda', autenticar, skillsController.cadastrarDemanda);
router.post('/oferta', autenticar, skillsController.cadastrarOferta);

module.exports = router;