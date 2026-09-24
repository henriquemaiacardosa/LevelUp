const request = require('supertest');
const app = require('../../app');

jest.mock('./skills.service');
const skillsService = require('./skills.service');

jest.mock('../../middlewares/auth.middleware', () =>
  (req, res, next) => {
    req.usuario = { id_usuario: 10 };
    next();
  }
);

describe('POST /api/skills/demanda (RF05)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 201 ao cadastrar uma demanda com sucesso', async () => {
    skillsService.cadastrarDemanda.mockResolvedValue({
      id_habilidade: 1,
      id_usuario: 10,
      id_disciplina: 3,
      tipo_habilidade: 'DEMANDA',
    });

    const resposta = await request(app)
      .post('/api/skills/demanda')
      .send({ id_disciplina: 3 });

    expect(resposta.status).toBe(201);
    expect(resposta.body.tipo_habilidade).toBe('DEMANDA');
  });

  it('deve retornar 400 se id_disciplina não for enviado', async () => {
    const resposta = await request(app).post('/api/skills/demanda').send({});

    expect(resposta.status).toBe(400);
    expect(skillsService.cadastrarDemanda).not.toHaveBeenCalled();
  });
});