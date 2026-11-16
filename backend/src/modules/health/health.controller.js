const healthService = require('./health.service');

async function verificar(req, res) {
  const resultado = await healthService.verificar();
  const codigo = resultado.status === 'ok' ? 200 : 503;
  return res.status(codigo).json(resultado);
}

module.exports = { verificar };