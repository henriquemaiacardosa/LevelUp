const disciplinasRepository = require('./disciplinas.repository');

async function listarDisciplinas() {
  return disciplinasRepository.listarTodas();
}

module.exports = { listarDisciplinas };