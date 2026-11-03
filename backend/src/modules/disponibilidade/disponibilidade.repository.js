const prisma = require('../../config/prisma');

function listarPorUsuario(id_usuario) {
  return prisma.disponibilidade.findMany({
    where: { id_usuario },
    select: { dia_semana: true, turno: true },
    orderBy: [{ dia_semana: 'asc' }, { turno: 'asc' }],
  });
}

function substituirPorUsuario(id_usuario, itens) {
  const operacoes = [prisma.disponibilidade.deleteMany({ where: { id_usuario } })];

  if (itens.length > 0) {
    operacoes.push(
      prisma.disponibilidade.createMany({
        data: itens.map((item) => ({ id_usuario, ...item })),
      })
    );
  }

  return prisma.$transaction(operacoes);
}

module.exports = { listarPorUsuario, substituirPorUsuario };