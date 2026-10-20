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

describe('PATCH /api/mentorias/:id/status (RF11)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 200 com a mentoria atualizada', async () => {
    const atualizada = { id_mentoria: 1, id_tutor: 20, status: 'CONFIRMADA' };
    mentoriasService.responderSolicitacao.mockResolvedValue(atualizada);

    const resposta = await request(app)
      .patch('/api/mentorias/1/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'CONFIRMADA' });

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual(atualizada);
    expect(mentoriasService.responderSolicitacao).toHaveBeenCalledWith({
      id_mentoria: 1,
      id_usuario: 20,
      status: 'CONFIRMADA',
    });
  });

  it('deve retornar 400 se o id da mentoria não for um número inteiro', async () => {
    const resposta = await request(app)
      .patch('/api/mentorias/abc/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'CONFIRMADA' });

    expect(resposta.status).toBe(400);
    expect(mentoriasService.responderSolicitacao).not.toHaveBeenCalled();
  });

  it('deve retornar 400 se o status não for enviado', async () => {
    const resposta = await request(app)
      .patch('/api/mentorias/1/status')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(resposta.status).toBe(400);
    expect(mentoriasService.responderSolicitacao).not.toHaveBeenCalled();
  });

  it('deve repassar o 404 do service quando a mentoria não existe', async () => {
    mentoriasService.responderSolicitacao.mockRejectedValue(erroComStatus(404, 'Mentoria não encontrada.'));

    const resposta = await request(app)
      .patch('/api/mentorias/99/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'CONFIRMADA' });

    expect(resposta.status).toBe(404);
    expect(resposta.body).toEqual({ erro: 'Mentoria não encontrada.' });
  });

  it('deve repassar o 403 do service quando quem pede não é o tutor', async () => {
    mentoriasService.responderSolicitacao.mockRejectedValue(
      erroComStatus(403, 'Apenas o tutor da mentoria pode responder à solicitação.')
    );

    const resposta = await request(app)
      .patch('/api/mentorias/1/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'CONFIRMADA' });

    expect(resposta.status).toBe(403);
  });

  it('deve retornar 500 para erro inesperado', async () => {
    mentoriasService.responderSolicitacao.mockRejectedValue(new Error('falha no banco'));

    const resposta = await request(app)
      .patch('/api/mentorias/1/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'CONFIRMADA' });

    expect(resposta.status).toBe(500);
  });

  it('deve retornar 401 sem token (RN01)', async () => {
    const resposta = await request(app).patch('/api/mentorias/1/status').send({ status: 'CONFIRMADA' });

    expect(resposta.status).toBe(401);
    expect(mentoriasService.responderSolicitacao).not.toHaveBeenCalled();
  });
});