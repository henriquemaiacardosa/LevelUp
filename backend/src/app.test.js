const request = require('supertest');
const app = require('./app');

describe('app - cabeçalhos de resposta', () => {
  it('não revela que o servidor usa Express (sem X-Powered-By)', async () => {
    const resposta = await request(app).get('/api/rota-que-nao-existe');

    expect(resposta.headers['x-powered-by']).toBeUndefined();
  });
});