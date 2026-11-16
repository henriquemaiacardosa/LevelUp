jest.mock('./health.repository');
const request = require('supertest');
const healthRepository = require('./health.repository');
const app = require('../../app');

describe('GET /api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('responde 200 sem exigir token quando o banco responde', async () => {
    healthRepository.consultarBanco.mockResolvedValue(true);

    const resposta = await request(app).get('/api/health');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ status: 'ok', banco: 'ok' });
  });

  it('responde 503 quando o banco esta indisponivel', async () => {
    healthRepository.consultarBanco.mockRejectedValue(new Error('sem conexao'));

    const resposta = await request(app).get('/api/health');

    expect(resposta.status).toBe(503);
    expect(resposta.body).toEqual({ status: 'erro', banco: 'indisponivel' });
  });
});