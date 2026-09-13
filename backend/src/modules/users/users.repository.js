const prisma = require('../../config/prisma');

async function atualizarPerfil(id_usuario, { curso, semestre }) {
  return prisma.usuario.update({
    where: { id_usuario },
    data: { curso, semestre },
  });
}

module.exports = { atualizarPerfil };