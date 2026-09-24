const skillsRepository = require('./skills.repository');

async function cadastrarDemanda(id_usuario, id_disciplina) {
  return skillsRepository.criarHabilidade({
    id_usuario,
    id_disciplina,
    tipo_habilidade: 'DEMANDA',
  });
}

module.exports = { cadastrarDemanda };