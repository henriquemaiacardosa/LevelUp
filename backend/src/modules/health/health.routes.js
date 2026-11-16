const express = require('express');
const healthController = require('./health.controller');

const router = express.Router();

router.get('/', healthController.verificar);

module.exports = router;