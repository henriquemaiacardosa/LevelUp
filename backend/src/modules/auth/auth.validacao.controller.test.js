const request = require('supertest');
const app = require('../../app');

jest.mock('./auth.service');
const authService = require('./auth.service');

const CORPO_VALIDO = {
  nome: 'Ana Beatriz',
  email: 'ana@universidade.edu.br',
  senha: 'senhaSegura123',
};

const USUARIO_CRIADO = {
  id_usuario: 1,
  nome: 'Ana Beatriz',
  email: 'ana@universidade.edu.br',
  senha_hash: 'hash',
};

describe('POST /api/auth/cadastro - validação dos dados (RF01)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    'ana',
    'ana@',
    '@universidade.edu.br',
    'ana@universidade',
    'ana@@universidade.edu.br',
    'a na@universidade.edu.br',
    'ana@.edu.br',
    'ana@universidade.',
  ])('devolve 400 para e-mail inválido (%p) sem chamar o service', async (email) => {
    const resposta = await request(app)
      .post('/api/auth/cadastro')
      .send({ ...CORPO_VALIDO, email });

    expect(resposta.status).toBe(400);
    expect(resposta.body).toEqual({ erro: 'E-mail inválido.' });
    expect(authService.cadastrar).not.toHaveBeenCalled();
  });

  it('devolve 400 para senha com menos de 8 caracteres', async () => {
    const resposta = await request(app)
      .post('/api/auth/cadastro')
      .send({ ...CORPO_VALIDO, senha: '1234567' });

    expect(resposta.status).toBe(400);
    expect(resposta.body).toEqual({ erro: 'A senha deve ter pelo menos 8 caracteres.' });
    expect(authService.cadastrar).not.toHaveBeenCalled();
  });

  it('aceita senha com exatamente 8 caracteres', async () => {
    authService.cadastrar.mockResolvedValue(USUARIO_CRIADO);

    const resposta = await request(app)
      .post('/api/auth/cadastro')
      .send({ ...CORPO_VALIDO, senha: '12345678' });

    expect(resposta.status).toBe(201);
  });

  it.each(['', '   '])('devolve 400 para nome em branco (%p)', async (nome) => {
    const resposta = await request(app)
      .post('/api/auth/cadastro')
      .send({ ...CORPO_VALIDO, nome });

    expect(resposta.status).toBe(400);
    expect(authService.cadastrar).not.toHaveBeenCalled();
  });

  it('devolve 400 quando um campo não é texto', async () => {
    const resposta = await request(app)
      .post('/api/auth/cadastro')
      .send({ ...CORPO_VALIDO, senha: 12345678 });

    expect(resposta.status).toBe(400);
    expect(authService.cadastrar).not.toHaveBeenCalled();
  });

  it('remove espaços do nome e do e-mail e guarda o e-mail em minúsculas', async () => {
    authService.cadastrar.mockResolvedValue(USUARIO_CRIADO);

    await request(app)
      .post('/api/auth/cadastro')
      .send({ nome: '  Ana Beatriz  ', email: '  Ana@Universidade.EDU.br  ', senha: 'senhaSegura123' });

    expect(authService.cadastrar).toHaveBeenCalledWith({
      nome: 'Ana Beatriz',
      email: 'ana@universidade.edu.br',
      senha: 'senhaSegura123',
    });
  });

  it('devolve 400 quando a requisição não tem corpo', async () => {
    const resposta = await request(app).post('/api/auth/cadastro');

    expect(resposta.status).toBe(400);
    expect(authService.cadastrar).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/login - requisição sem corpo', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devolve 400 em vez de erro interno', async () => {
    const resposta = await request(app).post('/api/auth/login');

    expect(resposta.status).toBe(400);
    expect(authService.login).not.toHaveBeenCalled();
  });
});