// Seed de DEMONSTRAÇÃO — apenas dados fictícios (e-mails @exemplo.com).
// Uso: SEED_DEMO_SENHA="<senha>" node prisma/seed-demo.js
// Idempotente: pode ser executado várias vezes. Só mexe nos usuários demo.
// Pré-requisito: disciplinas já criadas (node prisma/seed.js).
const bcrypt = require('bcrypt');
const prisma = require('../src/config/prisma');

const DOMINIO = '@exemplo.com';

const usuarios = [
  { chave: 'ana', nome: 'Ana Beatriz Souza', curso: 'Engenharia de Software', semestre: 7 },
  { chave: 'bruno', nome: 'Bruno Carvalho', curso: 'Engenharia de Software', semestre: 6 },
  { chave: 'carla', nome: 'Carla Mendes', curso: 'Ciência da Computação', semestre: 8 },
  { chave: 'diego', nome: 'Diego Ferreira', curso: 'Sistemas de Informação', semestre: 5 },
  { chave: 'elisa', nome: 'Elisa Martins', curso: 'Engenharia de Software', semestre: 4 },
  { chave: 'felipe', nome: 'Felipe Rocha', curso: 'Ciência da Computação', semestre: 3 },
  { chave: 'gabriela', nome: 'Gabriela Lima', curso: 'Sistemas de Informação', semestre: 2 },
  { chave: 'henrique', nome: 'Henrique Alves', curso: 'Engenharia de Software', semestre: 1 },
];

// índices das disciplinas (ordem por id) em que cada um é tutor (OFERTA) ou precisa de ajuda (DEMANDA)
const habilidades = {
  ana: { OFERTA: [0, 1, 4], DEMANDA: [] },
  bruno: { OFERTA: [2, 3], DEMANDA: [5] },
  carla: { OFERTA: [3, 4, 5], DEMANDA: [] },
  diego: { OFERTA: [5], DEMANDA: [0] },
  elisa: { OFERTA: [2], DEMANDA: [1, 4] },
  felipe: { OFERTA: [], DEMANDA: [0, 2, 3] },
  gabriela: { OFERTA: [], DEMANDA: [2, 3, 5] },
  henrique: { OFERTA: [], DEMANDA: [0, 2] },
};

const disponibilidade = {
  ana: [['SEGUNDA', 'NOITE'], ['QUARTA', 'NOITE'], ['SABADO', 'MANHA']],
  bruno: [['TERCA', 'TARDE'], ['QUINTA', 'NOITE']],
  carla: [['SEXTA', 'TARDE'], ['SABADO', 'MANHA'], ['DOMINGO', 'TARDE']],
  diego: [['SEGUNDA', 'TARDE'], ['QUARTA', 'TARDE']],
  elisa: [['TERCA', 'NOITE'], ['QUINTA', 'NOITE']],
};

// Mentorias: dias relativos a hoje (negativo = passado).
// Passado só em CONCLUIDA/CANCELADA; PENDENTE/CONFIRMADA sempre no futuro.
const mentorias = [
  { aluno: 'felipe', tutor: 'ana', disc: 0, dias: -14, status: 'CONCLUIDA' },
  { aluno: 'gabriela', tutor: 'bruno', disc: 2, dias: -12, status: 'CONCLUIDA' },
  { aluno: 'henrique', tutor: 'ana', disc: 0, dias: -9, status: 'CONCLUIDA' },
  { aluno: 'felipe', tutor: 'carla', disc: 3, dias: -7, status: 'CONCLUIDA' },
  { aluno: 'elisa', tutor: 'ana', disc: 4, dias: -5, status: 'CONCLUIDA' },
  { aluno: 'bruno', tutor: 'carla', disc: 5, dias: -3, status: 'CONCLUIDA' },
  { aluno: 'diego', tutor: 'ana', disc: 0, dias: -6, status: 'CANCELADA' },
  { aluno: 'gabriela', tutor: 'carla', disc: 3, dias: 2, status: 'CONFIRMADA', link: 'https://meet.google.com/demo-levelup-abc' },
  { aluno: 'henrique', tutor: 'bruno', disc: 2, dias: 3, status: 'CONFIRMADA', link: 'https://meet.google.com/demo-levelup-def' },
  { aluno: 'elisa', tutor: 'diego', disc: 5, dias: 4, status: 'PENDENTE' },
  { aluno: 'felipe', tutor: 'bruno', disc: 2, dias: 5, status: 'PENDENTE' },
];

function dataRelativa(dias) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dias);
  d.setUTCHours(17, 0, 0, 0); // 14h em Brasília
  return d;
}

async function main() {
  const senha = process.env.SEED_DEMO_SENHA;
  if (!senha || senha.length < 8) {
    throw new Error('Defina SEED_DEMO_SENHA com pelo menos 8 caracteres.');
  }

  const disciplinas = await prisma.disciplina.findMany({ orderBy: { id_disciplina: 'asc' } });
  if (disciplinas.length < 6) {
    throw new Error('Rode antes "node prisma/seed.js" (disciplinas ausentes).');
  }

  const senha_hash = await bcrypt.hash(senha, 10);

  // XP coerente com as mentorias concluídas: tutor +50, aluno +20
  const xp = {};
  for (const u of usuarios) xp[u.chave] = { xp_ensino: 0, xp_aprendizado: 0 };
  for (const m of mentorias.filter((x) => x.status === 'CONCLUIDA')) {
    xp[m.tutor].xp_ensino += 50;
    xp[m.aluno].xp_aprendizado += 20;
  }

  const ids = {};
  for (const u of usuarios) {
    const dados = {
      nome: u.nome,
      curso: u.curso,
      semestre: u.semestre,
      senha_hash,
      ...xp[u.chave],
    };
    const criado = await prisma.usuario.upsert({
      where: { email: `${u.chave}${DOMINIO}` },
      update: dados,
      create: { email: `${u.chave}${DOMINIO}`, ...dados },
    });
    ids[u.chave] = criado.id_usuario;
  }

  for (const [chave, tipos] of Object.entries(habilidades)) {
    for (const [tipo, indices] of Object.entries(tipos)) {
      for (const i of indices) {
        const chaveUnica = {
          id_usuario: ids[chave],
          id_disciplina: disciplinas[i].id_disciplina,
          tipo_habilidade: tipo,
        };
        await prisma.inventario_Habilidades.upsert({
          where: { id_usuario_id_disciplina_tipo_habilidade: chaveUnica },
          update: {},
          create: chaveUnica,
        });
      }
    }
  }

  for (const [chave, horarios] of Object.entries(disponibilidade)) {
    for (const [dia_semana, turno] of horarios) {
      const chaveUnica = { id_usuario: ids[chave], dia_semana, turno };
      await prisma.disponibilidade.upsert({
        where: { id_usuario_dia_semana_turno: chaveUnica },
        update: {},
        create: chaveUnica,
      });
    }
  }

  // Recria as mentorias dos usuários demo (idempotência)
  const idsDemo = Object.values(ids);
  await prisma.mentoria.deleteMany({
    where: { OR: [{ id_aluno: { in: idsDemo } }, { id_tutor: { in: idsDemo } }] },
  });
  for (const m of mentorias) {
    await prisma.mentoria.create({
      data: {
        id_aluno: ids[m.aluno],
        id_tutor: ids[m.tutor],
        id_disciplina: disciplinas[m.disc].id_disciplina,
        data_hora: dataRelativa(m.dias),
        status: m.status,
        link_videochamada: m.link ?? null,
      },
    });
  }

  console.log(`Seed demo OK: ${usuarios.length} usuários, ${mentorias.length} mentorias.`);
  console.log('Contas demo:', usuarios.map((u) => `${u.chave}${DOMINIO}`).join(', '));
}

main()
  .catch((erro) => {
    console.error('Erro no seed demo:', erro.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });