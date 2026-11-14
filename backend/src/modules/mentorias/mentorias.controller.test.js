jest.mock('./mentorias.service');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const mentoriasService = require('./mentorias.service');

const token = jwt.sign({ id_usuario: 10 }, process.env.JWT_SECRET);
const dataFutura = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

const corpoValido = { id_tutor: 20, id_disciplina: 5, data_hora: dataFutura };

describe('POST /api/mentorias (RF10)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 201 com a mentoria criada', async () => {
    const criada = { id_mentoria: 1, id_aluno: 10, id_tutor: 20, id_disciplina: 5, status: 'PENDENTE' };
    mentoriasService.solicitarMentoria.mockResolvedValue(criada);

    const resposta = await request(app)
      .post('/api/mentorias')
      .set('Authorization', `Bearer ${token}`)
      .send(corpoValido);

    expect(resposta.status).toBe(201);
    expect(resposta.body).toEqual(criada);
    expect(mentoriasService.solicitarMentoria).toHaveBeenCalledWith({
      id_aluno: 10,
      id_tutor: 20,
      id_disciplina: 5,
      data_hora: dataFutura,
    });
  });

  it('deve usar o id_aluno do token e ignorar o enviado no corpo', async () => {
    mentoriasService.solicitarMentoria.mockResolvedValue({ id_mentoria: 2 });

    await request(app)
      .post('/api/mentorias')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...corpoValido, id_aluno: 99 });

    expect(mentoriasService.solicitarMentoria).toHaveBeenCalledWith(
      expect.objectContaining({ id_aluno: 10 })
    );
  });

  it('deve retornar 400 se faltar id_tutor', async () => {
    const resposta = await request(app)
      .post('/api/mentorias')
      .set('Authorization', `Bearer ${token}`)
      .send({ id_disciplina: 5, data_hora: dataFutura });

    expect(resposta.status).toBe(400);
    expect(mentoriasService.solicitarMentoria).not.toHaveBeenCalled();
  });

  it('deve retornar 400 se faltar data_hora', async () => {
    const resposta = await request(app)
      .post('/api/mentorias')
      .set('Authorization', `Bearer ${token}`)
      .send({ id_tutor: 20, id_disciplina: 5 });

    expect(resposta.status).toBe(400);
    expect(mentoriasService.solicitarMentoria).not.toHaveBeenCalled();
  });

  it('deve repassar o status e a mensagem de erro do service', async () => {
    const erro = new Error('Não é possível agendar uma mentoria consigo mesmo.');
    erro.status = 400;
    mentoriasService.solicitarMentoria.mockRejectedValue(erro);

    const resposta = await request(app)
      .post('/api/mentorias')
      .set('Authorization', `Bearer ${token}`)
      .send(corpoValido);

    expect(resposta.status).toBe(400);
    expect(resposta.body).toEqual({ erro: 'Não é possível agendar uma mentoria consigo mesmo.' });
  });

  it('deve retornar 500 para erro inesperado', async () => {
    mentoriasService.solicitarMentoria.mockRejectedValue(new Error('falha no banco'));

    const resposta = await request(app)
      .post('/api/mentorias')
      .set('Authorization', `Bearer ${token}`)
      .send(corpoValido);

    expect(resposta.status).toBe(500);
  });

  it('deve retornar 401 sem token (RN01)', async () => {
    const resposta = await request(app).post('/api/mentorias').send(corpoValido);

    expect(resposta.status).toBe(401);
    expect(mentoriasService.solicitarMentoria).not.toHaveBeenCalled();
  });
});