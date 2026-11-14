const express = require('express');
const tutoresController = require('./tutores.controller');
const autenticar = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/:id_usuario', autenticar, tutoresController.detalhar);

module.exports = router;