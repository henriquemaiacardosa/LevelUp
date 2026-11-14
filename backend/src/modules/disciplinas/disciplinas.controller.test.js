jest.mock('./disciplinas.service');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const disciplinasService = require('./disciplinas.service');

function tokenDoUsuario(id_usuario) {
  return jwt.sign({ id_usuario }, process.env.JWT_SECRET);
}

describe('GET /api/disciplinas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('401 sem token (RN01)', async () => {
    const resposta = await request(app).get('/api/disciplinas');

    expect(resposta.status).toBe(401);
    expect(disciplinasService.listarDisciplinas).not.toHaveBeenCalled();
  });

  test('200 com a lista de disciplinas', async () => {
    const lista = [
      { id_disciplina: 1, nome_disciplina: 'Cálculo I', area_conhecimento: 'Exatas' },
    ];
    disciplinasService.listarDisciplinas.mockResolvedValue(lista);

    const resposta = await request(app)
      .get('/api/disciplinas')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual(lista);
  });

  test('500 genérico para erro inesperado, sem vazar detalhe', async () => {
    disciplinasService.listarDisciplinas.mockRejectedValue(
      new Error('falha no banco xyz')
    );

    const resposta = await request(app)
      .get('/api/disciplinas')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(resposta.status).toBe(500);
    expect(JSON.stringify(resposta.body)).not.toContain('xyz');
  });
});