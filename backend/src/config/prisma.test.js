const prisma = require('./prisma');

describe('Conexão com o banco de dados', () => {
 
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve conseguir se conectar ao MySQL sem lançar erro', async () => {
    const result = await prisma.$queryRaw`SELECT 1 AS conexao_ok`;

    expect(result).toEqual([{ conexao_ok: 1n }]);
  });
});