const healthRepository = require('./health.repository');

async function verificar() {
  try {
    await healthRepository.consultarBanco();
    return { status: 'ok', banco: 'ok' };
  } catch (erro) {
    console.error(erro);
    return { status: 'erro', banco: 'indisponivel' };
  }
}

module.exports = { verificar };