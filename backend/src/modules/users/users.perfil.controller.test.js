jest.mock('./users.service');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const usersService = require('./users.service');

function tokenDoUsuario(id_usuario) {
  return jwt.sign({ id_usuario }, process.env.JWT_SECRET);
}

describe('GET /api/users/perfil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('401 sem token (RN01)', async () => {
    const resposta = await request(app).get('/api/users/perfil');

    expect(resposta.status).toBe(401);
    expect(usersService.obterPerfil).not.toHaveBeenCalled();
  });

  test('200 com o perfil do usuário do token', async () => {
    const perfil = {
      id_usuario: 11,
      nome: 'Tutor Teste',
      email: 'tutor@teste.com',
      curso: 'Engenharia de Software',
      semestre: 7,
    };
    usersService.obterPerfil.mockResolvedValue(perfil);

    const resposta = await request(app)
      .get('/api/users/perfil')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual(perfil);
    expect(usersService.obterPerfil).toHaveBeenCalledWith(11);
  });

  test('ignora id_usuario enviado na query (vem só do token)', async () => {
    usersService.obterPerfil.mockResolvedValue({ id_usuario: 12 });

    await request(app)
      .get('/api/users/perfil?id_usuario=99')
      .set('Authorization', `Bearer ${tokenDoUsuario(12)}`);

    expect(usersService.obterPerfil).toHaveBeenCalledWith(12);
  });

  test('repassa o status de erro do service (404)', async () => {
    const erro = new Error('Usuário não encontrado.');
    erro.status = 404;
    usersService.obterPerfil.mockRejectedValue(erro);

    const resposta = await request(app)
      .get('/api/users/perfil')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro).toBe('Usuário não encontrado.');
  });

  test('500 genérico para erro inesperado, sem vazar detalhe', async () => {
    usersService.obterPerfil.mockRejectedValue(new Error('falha no banco xyz'));

    const resposta = await request(app)
      .get('/api/users/perfil')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(resposta.status).toBe(500);
    expect(JSON.stringify(resposta.body)).not.toContain('xyz');
  });
});