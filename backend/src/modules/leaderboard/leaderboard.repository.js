const prisma = require('../../config/prisma');

async function listarUsuariosComXp() {
  return prisma.usuario.findMany({
    where: {
      OR: [{ xp_ensino: { gt: 0 } }, { xp_aprendizado: { gt: 0 } }],
    },
    select: {
      id_usuario: true,
      nome: true,
      xp_ensino: true,
      xp_aprendizado: true,
    },
  });
}

module.exports = { listarUsuariosComXp };