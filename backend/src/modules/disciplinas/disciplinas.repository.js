const prisma = require('../../config/prisma'); 

async function listarTodas() {
  return prisma.disciplina.findMany({
    orderBy: { nome_disciplina: 'asc' },
    select: {
      id_disciplina: true,
      nome_disciplina: true,
      area_conhecimento: true,
    },
  });
}

module.exports = { listarTodas };