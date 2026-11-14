const request = require('supertest');
const app = require('../../app');
const { gerarToken } = require('../../utils/jwt');

jest.mock('./users.service');
const usersService = require('./users.service');

describe('Protecao da rota PUT /api/users/perfil (RN01)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 401 se nenhum token for enviado', async () => {
    const resposta = await request(app)
      .put('/api/users/perfil')
      .send({ curso: 'Engenharia de Software' });

    expect(resposta.status).toBe(401);
    expect(usersService.atualizarPerfil).not.toHaveBeenCalled();
  });

  it('deve retornar 200 se um token válido for enviado', async () => {
    const token = gerarToken({ id_usuario: 1 });

    usersService.atualizarPerfil.mockResolvedValue({
      id_usuario: 1,
      curso: 'Engenharia de Software',
      semestre: 5,
    });

    const resposta = await request(app)
      .put('/api/users/perfil')
      .set('Authorization', `Bearer ${token}`)
      .send({ curso: 'Engenharia de Software', semestre: 5 });

    expect(resposta.status).toBe(200);
  });
});