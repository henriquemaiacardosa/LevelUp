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

async function buscarXpPorId(id_usuario) {
  return prisma.usuario.findUnique({
    where: { id_usuario },
    select: { xp_ensino: true, xp_aprendizado: true },
  });
}

async function buscarPerfilPorId(id_usuario) {
  return prisma.usuario.findUnique({
    where: { id_usuario },
    select: {
      id_usuario: true,
      nome: true,
      email: true,
      curso: true,
      semestre: true,
    },
  });
}

module.exports = { atualizarPerfil, buscarXpPorId, buscarPerfilPorId };