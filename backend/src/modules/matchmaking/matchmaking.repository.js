const prisma = require('../../config/prisma');

async function buscarTutoresPorDisciplina({ id_disciplina, id_usuario_logado }) {
  return prisma.usuario.findMany({
    where: {
      id_usuario: { not: id_usuario_logado },
      habilidades: {
        some: { id_disciplina, tipo_habilidade: 'OFERTA' },
      },
    },
    select: {
      id_usuario: true,
      nome: true,
      curso: true,
      semestre: true,
    },
  });
}

module.exports = { buscarTutoresPorDisciplina };