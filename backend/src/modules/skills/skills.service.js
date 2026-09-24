const skillsRepository = require('./skills.repository');

async function cadastrarDemanda(id_usuario, id_disciplina) {
  return skillsRepository.criarHabilidade({
    id_usuario,
    id_disciplina,
    tipo_habilidade: 'DEMANDA',
  });
}

async function cadastrarOferta(id_usuario, id_disciplina) {
  return skillsRepository.criarHabilidade({
    id_usuario,
    id_disciplina,
    tipo_habilidade: 'OFERTA',
  });
}

module.exports = { cadastrarDemanda, cadastrarOferta };