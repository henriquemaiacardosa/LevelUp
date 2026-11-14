const tutoresRepository = require('./tutores.repository');

const XP_POR_NIVEL = 100;

function erro(status, mensagem) {
  const e = new Error(mensagem);
  e.status = status;
  return e;
}

async function obterDetalhesTutor(id_usuario_logado, id_tutor) {
  const id = Number(id_tutor);

  if (!Number.isInteger(id) || id < 1) {
    throw erro(400, 'Identificador do tutor inválido.');
  }

  if (id === id_usuario_logado) {
    throw erro(400, 'Você não pode ver os detalhes de si mesmo.');
  }

  const tutor = await tutoresRepository.buscarTutorPorId(id);

  if (!tutor || tutor.habilidades.length === 0) {
    throw erro(404, 'Tutor não encontrado.');
  }

  const xp_total = tutor.xp_ensino + tutor.xp_aprendizado;

  return {
    id_usuario: tutor.id_usuario,
    nome: tutor.nome,
    curso: tutor.curso,
    semestre: tutor.semestre,
    xp_ensino: tutor.xp_ensino,
    xp_total,
    nivel: Math.floor(xp_total / XP_POR_NIVEL) + 1,
    disciplinas: tutor.habilidades.map(({ disciplina }) => ({
      id_disciplina: disciplina.id_disciplina,
      nome_disciplina: disciplina.nome_disciplina,
    })),
    disponibilidade: tutor.disponibilidades.map(({ dia_semana, turno }) => ({
      dia_semana,
      turno,
    })),
  };
}

module.exports = { obterDetalhesTutor };