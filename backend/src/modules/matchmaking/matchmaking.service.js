const matchmakingRepository = require('./matchmaking.repository');

async function buscarTutores(id_usuario_logado, id_disciplina) {
  return matchmakingRepository.buscarTutoresPorDisciplina({
    id_disciplina,
    id_usuario_logado,
  });
}

module.exports = { buscarTutores };