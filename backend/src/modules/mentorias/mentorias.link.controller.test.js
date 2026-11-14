jest.mock('./mentorias.service');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const mentoriasService = require('./mentorias.service');

const token = jwt.sign({ id_usuario: 20 }, process.env.JWT_SECRET);
const link = 'https://meet.google.com/abc-defg-hij';

const erroComStatus = (status, mensagem) => {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
};

describe('PATCH /api/mentorias/:id/link (RF13)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 200 com a mentoria atualizada', async () => {
    const atualizada = { id_mentoria: 1, id_tutor: 20, status: 'CONFIRMADA', link_videochamada: link };
    mentoriasService.definirLink.mockResolvedValue(atualizada);

    const resposta = await request(app)
      .patch('/api/mentorias/1/link')
      .set('Authorization', `Bearer ${token}`)
      .send({ link_videochamada: link });

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual(atualizada);
    expect(mentoriasService.definirLink).toHaveBeenCalledWith({
      id_mentoria: 1,
      id_usuario: 20,
      link_videochamada: link,
    });
  });

  it('deve retornar 400 se o id da mentoria não for um número inteiro', async () => {
    const resposta = await request(app)
      .patch('/api/mentorias/abc/link')
      .set('Authorization', `Bearer ${token}`)
      .send({ link_videochamada: link });

    expect(resposta.status).toBe(400);
    expect(mentoriasService.definirLink).not.toHaveBeenCalled();
  });

  it('deve retornar 400 se o link não for enviado', async () => {
    const resposta = await request(app)
      .patch('/api/mentorias/1/link')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(resposta.status).toBe(400);
    expect(mentoriasService.definirLink).not.toHaveBeenCalled();
  });

  it('deve repassar o 403 do service quando quem pede não é o tutor', async () => {
    mentoriasService.definirLink.mockRejectedValue(
      erroComStatus(403, 'Apenas o tutor da mentoria pode definir o link.')
    );

    const resposta = await request(app)
      .patch('/api/mentorias/1/link')
      .set('Authorization', `Bearer ${token}`)
      .send({ link_videochamada: link });

    expect(resposta.status).toBe(403);
    expect(resposta.body).toEqual({ erro: 'Apenas o tutor da mentoria pode definir o link.' });
  });

  it('deve repassar o 409 do service quando a mentoria não está confirmada', async () => {
    mentoriasService.definirLink.mockRejectedValue(
      erroComStatus(409, 'O link só pode ser definido em mentorias confirmadas.')
    );

    const resposta = await request(app)
      .patch('/api/mentorias/1/link')
      .set('Authorization', `Bearer ${token}`)
      .send({ link_videochamada: link });

    expect(resposta.status).toBe(409);
  });

  it('deve retornar 500 para erro inesperado', async () => {
    mentoriasService.definirLink.mockRejectedValue(new Error('falha no banco'));

    const resposta = await request(app)
      .patch('/api/mentorias/1/link')
      .set('Authorization', `Bearer ${token}`)
      .send({ link_videochamada: link });

    expect(resposta.status).toBe(500);
  });

  it('deve retornar 401 sem token (RN01)', async () => {
    const resposta = await request(app)
      .patch('/api/mentorias/1/link')
      .send({ link_videochamada: link });

    expect(resposta.status).toBe(401);
    expect(mentoriasService.definirLink).not.toHaveBeenCalled();
  });
});