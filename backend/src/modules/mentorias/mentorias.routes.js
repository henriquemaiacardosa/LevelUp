const { Router } = require('express');
const autenticar = require('../../middlewares/auth.middleware');
const mentoriasController = require('./mentorias.controller');

const router = Router();

router.post('/', autenticar, mentoriasController.solicitar);
router.patch('/:id/status', autenticar, mentoriasController.responder);
router.patch('/:id/link', autenticar, mentoriasController.definirLink);

module.exports = router;