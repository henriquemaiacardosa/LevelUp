const express = require('express');
const authController = require('./auth.controller');

const router = express.Router();

router.post('/cadastro', authController.cadastrar);

module.exports = router;