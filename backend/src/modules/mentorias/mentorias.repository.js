const prisma = require('../../config/prisma');

async function tutorOfereceDisciplina(id_tutor, id_disciplina) {
  const oferta = await prisma.inventario_Habilidades.findFirst({
    where: { id_usuario: id_tutor, id_disciplina, tipo_habilidade: 'OFERTA' },
  });
  return Boolean(oferta);
}

async function criarMentoria({ id_aluno, id_tutor, id_disciplina, data_hora }) {
  return prisma.mentoria.create({
    data: { id_aluno, id_tutor, id_disciplina, data_hora },
  });
}

async function buscarPorId(id_mentoria) {
  return prisma.mentoria.findUnique({ where: { id_mentoria } });
}

async function atualizarStatus(id_mentoria, status) {
  return prisma.mentoria.update({ where: { id_mentoria }, data: { status } });
}

async function atualizarLink(id_mentoria, link_videochamada) {
  return prisma.mentoria.update({ where: { id_mentoria }, data: { link_videochamada } });
}

async function concluirComXp({ id_mentoria, id_tutor, id_aluno, xp_tutor, xp_aluno }) {
  return prisma.$transaction(async (tx) => {
    const atualizadas = await tx.mentoria.updateMany({
      where: { id_mentoria, status: 'CONFIRMADA' },
      data: { status: 'CONCLUIDA' },
    });

    if (atualizadas.count === 0) {
      const erro = new Error('A mentoria não está mais confirmada.');
      erro.status = 409;
      throw erro;
    }

    await tx.usuario.update({
      where: { id_usuario: id_tutor },
      data: { xp_ensino: { increment: xp_tutor } },
    });
    await tx.usuario.update({
      where: { id_usuario: id_aluno },
      data: { xp_aprendizado: { increment: xp_aluno } },
    });

    return tx.mentoria.findUnique({ where: { id_mentoria } });
  });
}

module.exports = {tutorOfereceDisciplina,criarMentoria,buscarPorId,atualizarStatus,atualizarLink,concluirComXp,};

