jest.mock('./matchmaking.service');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const matchmakingService = require('./matchmaking.service');

const token = jwt.sign({ id_usuario: 10 }, process.env.JWT_SECRET);

describe('GET /api/matchmaking (RF08)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 200 com a lista de tutores da disciplina', async () => {
    const tutores = [{ id_usuario: 20, nome: 'Marina', curso: 'Eng. Elétrica', semestre: 7 }];
    matchmakingService.buscarTutores.mockResolvedValue(tutores);

    const resposta = await request(app)
      .get('/api/matchmaking?id_disciplina=5')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual(tutores);
    expect(matchmakingService.buscarTutores).toHaveBeenCalledWith(10, 5);
  });

  it('deve retornar 400 se id_disciplina não for enviado', async () => {
    const resposta = await request(app)
      .get('/api/matchmaking')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(400);
    expect(matchmakingService.buscarTutores).not.toHaveBeenCalled();
  });

  it('deve retornar 400 se id_disciplina não for um número inteiro', async () => {
    const resposta = await request(app)
      .get('/api/matchmaking?id_disciplina=abc')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(400);
    expect(matchmakingService.buscarTutores).not.toHaveBeenCalled();
  });

  it('deve retornar 401 sem token (RN01)', async () => {
    const resposta = await request(app).get('/api/matchmaking?id_disciplina=5');

    expect(resposta.status).toBe(401);
    expect(matchmakingService.buscarTutores).not.toHaveBeenCalled();
  });
});