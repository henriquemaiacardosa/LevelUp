const { Router } = require('express');
const autenticar = require('../../middlewares/auth.middleware');
const mentoriasController = require('./mentorias.controller');

const router = Router();

router.post('/', autenticar, mentoriasController.solicitar);
router.patch('/:id/status', autenticar, mentoriasController.responder);
router.patch('/:id/link', autenticar, mentoriasController.definirLink);
router.patch('/:id/concluir', autenticar, mentoriasController.concluir);
router.get('/', autenticar, mentoriasController.listar);
router.patch('/:id/cancelar', autenticar, mentoriasController.cancelar);

module.exports = router;