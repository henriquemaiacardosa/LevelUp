const request = require('supertest');
const app = require('../../app');

jest.mock('./auth.service');
const authService = require('./auth.service');

describe('POST /api/auth/cadastro (RF01)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 201 e os dados do usuário (sem a senha) quando o cadastro for bem-sucedido', async () => {
    authService.cadastrar.mockResolvedValue({
      id_usuario: 1,
      nome: 'Ana Beatriz',
      email: 'ana@universidade.edu.br',
      senha_hash: 'hash-nao-deveria-aparecer-na-resposta',
    });

    const resposta = await request(app).post('/api/auth/cadastro').send({
      nome: 'Ana Beatriz',
      email: 'ana@universidade.edu.br',
      senha: 'senhaSegura123',
    });

    expect(resposta.status).toBe(201);
    expect(resposta.body.email).toBe('ana@universidade.edu.br');
    expect(resposta.body.senha_hash).toBeUndefined(); // segurança: hash nunca sai na resposta
  });

  it('deve retornar 400 se algum campo obrigatório estiver faltando', async () => {
    const resposta = await request(app).post('/api/auth/cadastro').send({
      nome: 'Ana Beatriz',
      // faltando email e senha
    });

    expect(resposta.status).toBe(400);
    expect(authService.cadastrar).not.toHaveBeenCalled();
  });

  it('deve retornar 409 se o e-mail já estiver cadastrado', async () => {
    authService.cadastrar.mockRejectedValue(new Error('E-mail já cadastrado'));

    const resposta = await request(app).post('/api/auth/cadastro').send({
      nome: 'Ana Beatriz',
      email: 'ana@universidade.edu.br',
      senha: 'senhaSegura123',
    });

    expect(resposta.status).toBe(409);
    expect(resposta.body.erro).toBe('E-mail já cadastrado');
  });
});