jest.mock('./skills.service');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const skillsService = require('./skills.service');

function gerarToken(id_usuario) {
  return jwt.sign({ id_usuario }, process.env.JWT_SECRET);
}

describe('DELETE /api/skills/:id_habilidade', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sem token devolve 401', async () => {
    const res = await request(app).delete('/api/skills/15');

    expect(res.status).toBe(401);
    expect(skillsService.removerHabilidade).not.toHaveBeenCalled();
  });

  test('remove e devolve 204 sem corpo, usando o usuário do token', async () => {
    skillsService.removerHabilidade.mockResolvedValue();

    const res = await request(app)
      .delete('/api/skills/15')
      .set('Authorization', `Bearer ${gerarToken(7)}`);

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(skillsService.removerHabilidade).toHaveBeenCalledWith(7, '15');
  });

  test('erro de negócio devolve o status e a mensagem do service', async () => {
    const erro = new Error('Habilidade não encontrada.');
    erro.status = 404;
    skillsService.removerHabilidade.mockRejectedValue(erro);

    const res = await request(app)
      .delete('/api/skills/15')
      .set('Authorization', `Bearer ${gerarToken(7)}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ erro: 'Habilidade não encontrada.' });
  });

  test('erro inesperado devolve 500 sem detalhes internos', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    skillsService.removerHabilidade.mockRejectedValue(new Error('falha do banco'));

    const res = await request(app)
      .delete('/api/skills/15')
      .set('Authorization', `Bearer ${gerarToken(7)}`);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ erro: 'Erro interno do servidor.' });
  });
});