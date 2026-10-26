jest.mock('./leaderboard.service');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const leaderboardService = require('./leaderboard.service');

function tokenDoUsuario(id_usuario) {
  return jwt.sign({ id_usuario }, process.env.JWT_SECRET);
}

describe('GET /api/leaderboard (RF20)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('401 sem token (RN01)', async () => {
    const resposta = await request(app).get('/api/leaderboard');

    expect(resposta.status).toBe(401);
    expect(leaderboardService.obterLeaderboard).not.toHaveBeenCalled();
  });

  test('200 com o top e a posição do usuário do token', async () => {
    const retorno = {
      top: [{ posicao: 1, nome: 'Tutor Teste', xp_total: 70 }],
      minha_posicao: { posicao: 1, xp_total: 70 },
    };
    leaderboardService.obterLeaderboard.mockResolvedValue(retorno);

    const resposta = await request(app)
      .get('/api/leaderboard')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual(retorno);
    expect(leaderboardService.obterLeaderboard).toHaveBeenCalledWith(11);
  });

  test('ignora id_usuario enviado na query (vem só do token)', async () => {
    leaderboardService.obterLeaderboard.mockResolvedValue({
      top: [],
      minha_posicao: null,
    });

    await request(app)
      .get('/api/leaderboard?id_usuario=99')
      .set('Authorization', `Bearer ${tokenDoUsuario(12)}`);

    expect(leaderboardService.obterLeaderboard).toHaveBeenCalledWith(12);
  });

  test('repassa o status de erro do service', async () => {
    const erro = new Error('Falha conhecida.');
    erro.status = 404;
    leaderboardService.obterLeaderboard.mockRejectedValue(erro);

    const resposta = await request(app)
      .get('/api/leaderboard')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro).toBe('Falha conhecida.');
  });

  test('500 genérico para erro inesperado, sem vazar detalhe', async () => {
    leaderboardService.obterLeaderboard.mockRejectedValue(
      new Error('falha no banco xyz')
    );

    const resposta = await request(app)
      .get('/api/leaderboard')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(resposta.status).toBe(500);
    expect(JSON.stringify(resposta.body)).not.toContain('xyz');
  });
});