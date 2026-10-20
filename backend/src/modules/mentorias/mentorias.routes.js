const { Router } = require('express');
const autenticar = require('../../middlewares/auth.middleware');
const mentoriasController = require('./mentorias.controller');

const router = Router();

router.post('/', autenticar, mentoriasController.solicitar);

module.exports = router;