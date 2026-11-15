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

async function anonimizarUsuario(id_usuario, { nome, email, senha_hash }) {
  return prisma.$transaction(async (tx) => {
    await tx.mentoria.updateMany({
      where: {
        OR: [{ id_tutor: id_usuario }, { id_aluno: id_usuario }],
        status: { in: ['PENDENTE', 'CONFIRMADA'] },
      },
      data: { status: 'CANCELADA' },
    });
    await tx.inventario_Habilidades.deleteMany({ where: { id_usuario } });
    await tx.disponibilidade.deleteMany({ where: { id_usuario } });

    return tx.usuario.update({
      where: { id_usuario },
      data: {
        nome,
        email,
        senha_hash,
        curso: null,
        semestre: null,
        xp_ensino: 0,
        xp_aprendizado: 0,
      },
      select: { id_usuario: true },
    });
  });
}

module.exports = { atualizarPerfil, buscarXpPorId, buscarPerfilPorId, anonimizarUsuario };