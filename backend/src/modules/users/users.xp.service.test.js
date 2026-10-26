jest.mock('./users.repository');

const usersRepository = require('./users.repository');
const { consultarXp } = require('./users.service');

describe('users.service - consultarXp (RF19)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devolve xp de ensino, de aprendizado, total e nível', async () => {
    usersRepository.buscarXpPorId.mockResolvedValue({
      xp_ensino: 50,
      xp_aprendizado: 20,
    });

    const resultado = await consultarXp(11);

    expect(usersRepository.buscarXpPorId).toHaveBeenCalledWith(11);
    expect(resultado).toEqual({
      xp_ensino: 50,
      xp_aprendizado: 20,
      xp_total: 70,
      nivel: 1,
    });
  });

  test('usuário sem XP está no nível 1', async () => {
    usersRepository.buscarXpPorId.mockResolvedValue({
      xp_ensino: 0,
      xp_aprendizado: 0,
    });

    const resultado = await consultarXp(12);

    expect(resultado.xp_total).toBe(0);
    expect(resultado.nivel).toBe(1);
  });

  test('sobe de nível a cada 100 de XP total', async () => {
    usersRepository.buscarXpPorId.mockResolvedValue({
      xp_ensino: 80,
      xp_aprendizado: 20,
    });

    const resultado = await consultarXp(11);

    expect(resultado.xp_total).toBe(100);
    expect(resultado.nivel).toBe(2);
  });

  test('lança 404 se o usuário não existe', async () => {
    usersRepository.buscarXpPorId.mockResolvedValue(null);

    await expect(consultarXp(999)).rejects.toMatchObject({ status: 404 });
  });
});