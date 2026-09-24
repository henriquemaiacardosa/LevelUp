const prisma = require('../../config/prisma');

async function atualizarPerfil(id_usuario, { curso, semestre }) {
  return prisma.usuario.update({
    where: { id_usuario },
    data: { curso, semestre },
    select: {
      id_usuario: true,
      nome: true,
      email: true,
      curso: true,
      semestre: true,
    },
  });
}

module.exports = { atualizarPerfil };