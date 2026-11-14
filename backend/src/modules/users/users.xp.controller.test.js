jest.mock('./users.service');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const usersService = require('./users.service');

function tokenDoUsuario(id_usuario) {
  return jwt.sign({ id_usuario }, process.env.JWT_SECRET);
}

describe('GET /api/users/xp (RF19)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('401 sem token (RN01)', async () => {
    const resposta = await request(app).get('/api/users/xp');

    expect(resposta.status).toBe(401);
    expect(usersService.consultarXp).not.toHaveBeenCalled();
  });

  test('200 com o xp do usuário do token', async () => {
    usersService.consultarXp.mockResolvedValue({
      xp_ensino: 50,
      xp_aprendizado: 20,
      xp_total: 70,
      nivel: 1,
    });

    const resposta = await request(app)
      .get('/api/users/xp')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({
      xp_ensino: 50,
      xp_aprendizado: 20,
      xp_total: 70,
      nivel: 1,
    });
    expect(usersService.consultarXp).toHaveBeenCalledWith(11);
  });

  test('ignora id_usuario enviado na query (vem só do token)', async () => {
    usersService.consultarXp.mockResolvedValue({
      xp_ensino: 0,
      xp_aprendizado: 0,
      xp_total: 0,
      nivel: 1,
    });

    await request(app)
      .get('/api/users/xp?id_usuario=99')
      .set('Authorization', `Bearer ${tokenDoUsuario(12)}`);

    expect(usersService.consultarXp).toHaveBeenCalledWith(12);
  });

  test('repassa o status de erro do service (404)', async () => {
    const erro = new Error('Usuário não encontrado.');
    erro.status = 404;
    usersService.consultarXp.mockRejectedValue(erro);

    const resposta = await request(app)
      .get('/api/users/xp')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro).toBe('Usuário não encontrado.');
  });

  test('500 genérico para erro inesperado, sem vazar detalhe', async () => {
    usersService.consultarXp.mockRejectedValue(new Error('falha no banco xyz'));

    const resposta = await request(app)
      .get('/api/users/xp')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(resposta.status).toBe(500);
    expect(JSON.stringify(resposta.body)).not.toContain('xyz');
  });
});