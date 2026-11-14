jest.mock('./skills.service');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const skillsService = require('./skills.service');

function gerarToken(id_usuario) {
  return jwt.sign({ id_usuario }, process.env.JWT_SECRET);
}

describe('GET /api/skills', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sem token devolve 401', async () => {
    const res = await request(app).get('/api/skills');

    expect(res.status).toBe(401);
    expect(skillsService.listarMinhasHabilidades).not.toHaveBeenCalled();
  });

  test('com token devolve 200 e as habilidades do usuário do token', async () => {
    const habilidades = {
      oferta: [{ id_habilidade: 1, id_disciplina: 3, nome_disciplina: 'Cálculo I' }],
      demanda: [],
    };
    skillsService.listarMinhasHabilidades.mockResolvedValue(habilidades);

    const res = await request(app)
      .get('/api/skills')
      .set('Authorization', `Bearer ${gerarToken(7)}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(habilidades);
    expect(skillsService.listarMinhasHabilidades).toHaveBeenCalledWith(7);
  });

  test('erro de negócio devolve o status e a mensagem do service', async () => {
    const erro = new Error('Usuário não encontrado.');
    erro.status = 404;
    skillsService.listarMinhasHabilidades.mockRejectedValue(erro);

    const res = await request(app)
      .get('/api/skills')
      .set('Authorization', `Bearer ${gerarToken(7)}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ erro: 'Usuário não encontrado.' });
  });

  test('erro inesperado devolve 500 sem detalhes internos', async () => {
    skillsService.listarMinhasHabilidades.mockRejectedValue(new Error('falha do banco'));

    const res = await request(app)
      .get('/api/skills')
      .set('Authorization', `Bearer ${gerarToken(7)}`);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ erro: 'Erro interno do servidor.' });
  });
});