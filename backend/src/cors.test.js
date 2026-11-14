process.env.CORS_ORIGIN = 'http://localhost:5173';

const request = require('supertest');
const app = require('./app');

const ORIGEM_PERMITIDA = 'http://localhost:5173';
const ORIGEM_ESTRANHA = 'http://site-malicioso.com';

describe('CORS', () => {
  test('preflight da origem permitida libera PATCH e o header Authorization', async () => {
    const resposta = await request(app)
      .options('/api/mentorias/6/concluir')
      .set('Origin', ORIGEM_PERMITIDA)
      .set('Access-Control-Request-Method', 'PATCH')
      .set('Access-Control-Request-Headers', 'authorization,content-type');

    expect(resposta.status).toBe(204);
    expect(resposta.headers['access-control-allow-origin']).toBe(ORIGEM_PERMITIDA);
    expect(resposta.headers['access-control-allow-methods']).toContain('PATCH');
    expect(resposta.headers['access-control-allow-headers'].toLowerCase()).toContain(
      'authorization'
    );
  });

  test('resposta normal para a origem permitida traz o header de CORS', async () => {
    const resposta = await request(app)
      .get('/api/leaderboard')
      .set('Origin', ORIGEM_PERMITIDA);

    expect(resposta.status).toBe(401);
    expect(resposta.headers['access-control-allow-origin']).toBe(ORIGEM_PERMITIDA);
  });

  test('origem não permitida não recebe o header de CORS', async () => {
    const resposta = await request(app)
      .get('/api/leaderboard')
      .set('Origin', ORIGEM_ESTRANHA);

    expect(resposta.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('preflight de origem não permitida não recebe o header de CORS', async () => {
    const resposta = await request(app)
      .options('/api/mentorias')
      .set('Origin', ORIGEM_ESTRANHA)
      .set('Access-Control-Request-Method', 'GET');

    expect(resposta.headers['access-control-allow-origin']).toBeUndefined();
  });
});