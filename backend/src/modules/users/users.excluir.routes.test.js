jest.mock('./users.service');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const usersService = require('./users.service');

describe('DELETE /api/users/perfil (LGPD)', () => {
  const token = jwt.sign({ id_usuario: 10 }, process.env.JWT_SECRET);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exige autenticação (401 sem token)', async () => {
    const resposta = await request(app).delete('/api/users/perfil');

    expect(resposta.status).toBe(401);
    expect(usersService.excluirConta).not.toHaveBeenCalled();
  });

  it('exclui a conta do usuário do token e responde 204', async () => {
    usersService.excluirConta.mockResolvedValue();

    const resposta = await request(app)
      .delete('/api/users/perfil')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(204);
    expect(usersService.excluirConta).toHaveBeenCalledWith(10);
  });
});