jest.mock('./mentorias.service');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const mentoriasService = require('./mentorias.service');

const token = jwt.sign({ id_usuario: 20 }, process.env.JWT_SECRET);

const erroComStatus = (status, mensagem) => {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
};

describe('PATCH /api/mentorias/:id/concluir (RF14)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 200 com a mentoria concluída', async () => {
    const concluida = { id_mentoria: 1, id_tutor: 20, status: 'CONCLUIDA' };
    mentoriasService.concluirMentoria.mockResolvedValue(concluida);

    const resposta = await request(app)
      .patch('/api/mentorias/1/concluir')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual(concluida);
    expect(mentoriasService.concluirMentoria).toHaveBeenCalledWith({
      id_mentoria: 1,
      id_usuario: 20,
    });
  });

  it('deve retornar 400 se o id da mentoria não for um número inteiro', async () => {
    const resposta = await request(app)
      .patch('/api/mentorias/abc/concluir')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(400);
    expect(mentoriasService.concluirMentoria).not.toHaveBeenCalled();
  });

  it('deve repassar o 404 do service quando a mentoria não existe', async () => {
    mentoriasService.concluirMentoria.mockRejectedValue(erroComStatus(404, 'Mentoria não encontrada.'));

    const resposta = await request(app)
      .patch('/api/mentorias/99/concluir')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(404);
    expect(resposta.body).toEqual({ erro: 'Mentoria não encontrada.' });
  });

  it('deve repassar o 403 do service quando quem pede não é o tutor', async () => {
    mentoriasService.concluirMentoria.mockRejectedValue(
      erroComStatus(403, 'Apenas o tutor da mentoria pode concluí-la.')
    );

    const resposta = await request(app)
      .patch('/api/mentorias/1/concluir')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(403);
  });

  it('deve repassar o 409 do service (não confirmada, horário futuro ou já concluída)', async () => {
    mentoriasService.concluirMentoria.mockRejectedValue(
      erroComStatus(409, 'A mentoria ainda não aconteceu.')
    );

    const resposta = await request(app)
      .patch('/api/mentorias/1/concluir')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(409);
    expect(resposta.body).toEqual({ erro: 'A mentoria ainda não aconteceu.' });
  });

  it('deve retornar 500 para erro inesperado', async () => {
    mentoriasService.concluirMentoria.mockRejectedValue(new Error('falha no banco'));

    const resposta = await request(app)
      .patch('/api/mentorias/1/concluir')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(500);
  });

  it('deve retornar 401 sem token (RN01)', async () => {
    const resposta = await request(app).patch('/api/mentorias/1/concluir');

    expect(resposta.status).toBe(401);
    expect(mentoriasService.concluirMentoria).not.toHaveBeenCalled();
  });
});