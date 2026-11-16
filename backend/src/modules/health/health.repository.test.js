jest.mock('../../config/prisma', () => ({ $queryRaw: jest.fn() }));
const prisma = require('../../config/prisma');
const healthRepository = require('./health.repository');

describe('healthRepository.consultarBanco', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('executa uma consulta simples no banco e retorna true', async () => {
    prisma.$queryRaw.mockResolvedValue([{ ok: 1 }]);

    const resultado = await healthRepository.consultarBanco();

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(resultado).toBe(true);
  });

  it('propaga o erro quando o banco falha', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('sem conexao'));

    await expect(healthRepository.consultarBanco()).rejects.toThrow('sem conexao');
  });
});