const prisma = require('../../config/prisma');

function listarPorUsuario(id_usuario) {
  // A ordenação segue a ordem de declaração dos enums no schema.prisma (o MySQL
  // ordena ENUM pelo índice): SEGUNDA=1, TERCA=2, QUARTA=3, QUINTA=4, SEXTA=5,
  // SABADO=6, DOMINGO=7; e MANHA=1, TARDE=2, NOITE=3.
  // Se a ordem dos valores mudar no schema, a ordenação muda junto.
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