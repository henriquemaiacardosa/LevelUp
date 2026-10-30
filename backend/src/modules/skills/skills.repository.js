const prisma = require('../../config/prisma');

async function criarHabilidade({ id_usuario, id_disciplina, tipo_habilidade }) {
  return prisma.inventario_Habilidades.create({
    data: { id_usuario, id_disciplina, tipo_habilidade },
  });
}

async function listarPorUsuario(id_usuario) {
  return prisma.inventario_Habilidades.findMany({
    where: { id_usuario },
    select: {
      id_habilidade: true,
      tipo_habilidade: true,
      disciplina: { select: { id_disciplina: true, nome_disciplina: true } },
    },
    orderBy: { disciplina: { nome_disciplina: 'asc' } },
  });
}

module.exports = { criarHabilidade, listarPorUsuario };