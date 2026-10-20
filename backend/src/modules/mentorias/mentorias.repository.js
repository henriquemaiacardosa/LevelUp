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

module.exports = { tutorOfereceDisciplina, criarMentoria, buscarPorId, atualizarStatus };