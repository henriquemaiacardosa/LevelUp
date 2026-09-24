const prisma = require('../../config/prisma');

async function criarHabilidade({ id_usuario, id_disciplina, tipo_habilidade }) {
  return prisma.inventario_Habilidades.create({
    data: { id_usuario, id_disciplina, tipo_habilidade },
  });
}

module.exports = { criarHabilidade };