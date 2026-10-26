jest.mock('./leaderboard.repository');

const leaderboardRepository = require('./leaderboard.repository');
const { obterLeaderboard } = require('./leaderboard.service');

function usuario(id_usuario, xp_ensino, xp_aprendizado) {
  return { id_usuario, nome: `Usuario ${id_usuario}`, xp_ensino, xp_aprendizado };
}

describe('leaderboard.service - obterLeaderboard (RF20)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ordena por xp_total (ensino + aprendizado) e numera as posições', async () => {
    leaderboardRepository.listarUsuariosComXp.mockResolvedValue([
      usuario(1, 10, 0),
      usuario(2, 50, 20),
      usuario(3, 0, 30),
    ]);

    const resultado = await obterLeaderboard(1);

    expect(resultado.top).toEqual([
      { posicao: 1, nome: 'Usuario 2', xp_total: 70 },
      { posicao: 2, nome: 'Usuario 3', xp_total: 30 },
      { posicao: 3, nome: 'Usuario 1', xp_total: 10 },
    ]);
  });

  test('desempata pelo menor id_usuario', async () => {
    leaderboardRepository.listarUsuariosComXp.mockResolvedValue([
      usuario(9, 40, 0),
      usuario(3, 0, 40),
    ]);

    const resultado = await obterLeaderboard(9);

    expect(resultado.top.map((t) => t.nome)).toEqual(['Usuario 3', 'Usuario 9']);
  });

  test('devolve no máximo 10 no top', async () => {
    const lista = Array.from({ length: 12 }, (_, i) => usuario(i + 1, 100 - i, 0));
    leaderboardRepository.listarUsuariosComXp.mockResolvedValue(lista);

    const resultado = await obterLeaderboard(1);

    expect(resultado.top).toHaveLength(10);
    expect(resultado.top[0].posicao).toBe(1);
    expect(resultado.top[9].posicao).toBe(10);
  });

  test('minha_posicao aparece mesmo fora do top 10', async () => {
    const lista = Array.from({ length: 12 }, (_, i) => usuario(i + 1, 100 - i, 0));
    leaderboardRepository.listarUsuariosComXp.mockResolvedValue(lista);

    const resultado = await obterLeaderboard(11);

    expect(resultado.minha_posicao).toEqual({ posicao: 11, xp_total: 90 });
  });

  test('minha_posicao é null se o usuário não tem XP', async () => {
    leaderboardRepository.listarUsuariosComXp.mockResolvedValue([usuario(2, 50, 20)]);

    const resultado = await obterLeaderboard(99);

    expect(resultado.minha_posicao).toBeNull();
  });

  test('ranking vazio devolve top vazio e minha_posicao null', async () => {
    leaderboardRepository.listarUsuariosComXp.mockResolvedValue([]);

    const resultado = await obterLeaderboard(1);

    expect(resultado).toEqual({ top: [], minha_posicao: null });
  });

  test('não expõe id_usuario nem e-mail no top', async () => {
    leaderboardRepository.listarUsuariosComXp.mockResolvedValue([usuario(2, 50, 20)]);

    const resultado = await obterLeaderboard(2);

    expect(Object.keys(resultado.top[0]).sort()).toEqual(['nome', 'posicao', 'xp_total']);
  });
});