jest.mock('./tutores.service');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const tutoresService = require('./tutores.service');

function gerarToken(id_usuario) {
  return jwt.sign({ id_usuario }, process.env.JWT_SECRET);
}

describe('GET /api/tutores/:id_usuario', () => {
  let consoleErro;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErro = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErro.mockRestore();
  });

  test('sem token devolve 401', async () => {
    const res = await request(app).get('/api/tutores/12');

    expect(res.status).toBe(401);
    expect(tutoresService.obterDetalhesTutor).not.toHaveBeenCalled();
  });

  test('com token devolve 200 e os detalhes do tutor, usando o usuário do token', async () => {
    const detalhes = {
      id_usuario: 12,
      nome: 'Maria',
      curso: 'Engenharia de Software',
      semestre: 5,
      xp_ensino: 150,
      xp_total: 170,
      nivel: 2,
      disciplinas: [{ id_disciplina: 3, nome_disciplina: 'Cálculo I' }],
      disponibilidade: [{ dia_semana: 'SEGUNDA', turno: 'NOITE' }],
    };
    tutoresService.obterDetalhesTutor.mockResolvedValue(detalhes);

    const res = await request(app)
      .get('/api/tutores/12')
      .set('Authorization', `Bearer ${gerarToken(7)}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(detalhes);
    expect(tutoresService.obterDetalhesTutor).toHaveBeenCalledWith(7, '12');
  });

  test('tutor não encontrado devolve 404 com a mensagem do service', async () => {
    const erro = new Error('Tutor não encontrado.');
    erro.status = 404;
    tutoresService.obterDetalhesTutor.mockRejectedValue(erro);

    const res = await request(app)
      .get('/api/tutores/99')
      .set('Authorization', `Bearer ${gerarToken(7)}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ erro: 'Tutor não encontrado.' });
    expect(consoleErro).not.toHaveBeenCalled();
  });

  test('identificador inválido devolve 400 com a mensagem do service', async () => {
    const erro = new Error('Identificador do tutor inválido.');
    erro.status = 400;
    tutoresService.obterDetalhesTutor.mockRejectedValue(erro);

    const res = await request(app)
      .get('/api/tutores/abc')
      .set('Authorization', `Bearer ${gerarToken(7)}`);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ erro: 'Identificador do tutor inválido.' });
  });

  test('erro inesperado é registrado e devolve 500 sem detalhes internos', async () => {
    const falha = new Error('falha do banco');
    tutoresService.obterDetalhesTutor.mockRejectedValue(falha);

    const res = await request(app)
      .get('/api/tutores/12')
      .set('Authorization', `Bearer ${gerarToken(7)}`);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ erro: 'Erro interno do servidor.' });
    expect(consoleErro).toHaveBeenCalledWith(falha);
  });
});