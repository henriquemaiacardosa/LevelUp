const request = require('supertest');
const app = require('../../app');

jest.mock('./users.service');
const usersService = require('./users.service');

jest.mock('../../middlewares/auth.middleware', () =>
  (req, res, next) => {
    req.usuario = { id_usuario: 1 };
    next();
  }
);

describe('PUT /api/users/perfil (RF04)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 200 e o perfil atualizado', async () => {
    usersService.atualizarPerfil.mockResolvedValue({
      id_usuario: 1,
      curso: 'Engenharia de Software',
      semestre: 5,
    });

    const resposta = await request(app)
      .put('/api/users/perfil')
      .send({ curso: 'Engenharia de Software', semestre: 5 });

    expect(resposta.status).toBe(200);
    expect(resposta.body.curso).toBe('Engenharia de Software');
  });

  it('deve retornar 400 se semestre não for um número válido', async () => {
    const resposta = await request(app)
      .put('/api/users/perfil')
      .send({ curso: 'Engenharia de Software', semestre: 'quinto' });

    expect(resposta.status).toBe(400);
    expect(usersService.atualizarPerfil).not.toHaveBeenCalled();
  });
});