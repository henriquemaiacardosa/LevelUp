const prisma = require('../../config/prisma');

function buscarTutorPorId(id_usuario) {
  return prisma.usuario.findUnique({
    where: { id_usuario },
    select: {
      id_usuario: true,
      nome: true,
      curso: true,
      semestre: true,
      xp_ensino: true,
      xp_aprendizado: true,
      // Só as disciplinas que a pessoa ensina (OFERTA).
      habilidades: {
        where: { tipo_habilidade: 'OFERTA' },
        select: { disciplina: { select: { id_disciplina: true, nome_disciplina: true } } },
        orderBy: { disciplina: { nome_disciplina: 'asc' } },
      },
      // A ordenação segue a ordem de declaração dos enums no schema (SEGUNDA..DOMINGO, MANHA..NOITE).
      disponibilidades: {
        select: { dia_semana: true, turno: true },
        orderBy: [{ dia_semana: 'asc' }, { turno: 'asc' }],
      },
    },
  });
}

module.exports = { buscarTutorPorId };