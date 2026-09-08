const prisma = require('../src/config/prisma');

const disciplinas = [
  { nome_disciplina: 'Cálculo I', area_conhecimento: 'Matemática' },
  { nome_disciplina: 'Cálculo II', area_conhecimento: 'Matemática' },
  { nome_disciplina: 'Lógica de Programação', area_conhecimento: 'Computação' },
  { nome_disciplina: 'Algoritmos', area_conhecimento: 'Computação' },
  { nome_disciplina: 'Estrutura de Dados', area_conhecimento: 'Computação' },
  { nome_disciplina: 'Banco de Dados', area_conhecimento: 'Computação' },
];

async function main() {
  console.log('Iniciando o seed do banco de dados...');

  for (const disciplina of disciplinas) {
    await prisma.disciplina.upsert({
      where: { nome_disciplina: disciplina.nome_disciplina },
      update: {},
      create: disciplina,
    });
  }

  console.log(`${disciplinas.length} disciplinas inseridas/verificadas com sucesso.`);
}

main()
  .catch((erro) => {
    console.error('Erro ao rodar o seed:', erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });