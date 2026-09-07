const authService = require('./auth.service');
const authRepository = require('./auth.repository');
const { compararSenha } = require('../../utils/hash');

jest.mock('./auth.repository');

describe('AuthService - Cadastro de Usuário (RF01)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar um usuário novo com a senha em formato de hash', async () => {
    authRepository.buscarPorEmail.mockResolvedValue(null); // e-mail livre
    authRepository.criar.mockImplementation((dados) =>
      Promise.resolve({ id_usuario: 1, ...dados })
    );

    const usuario = await authService.cadastrar({
      nome: 'Ana Beatriz',
      email: 'ana@universidade.edu.br',
      senha: 'senhaSegura123',
    });

    expect(usuario.senha_hash).not.toBe('senhaSegura123');

    const senhaConfere = await compararSenha('senhaSegura123', usuario.senha_hash);
    expect(senhaConfere).toBe(true);

    expect(authRepository.criar).toHaveBeenCalledTimes(1);
  });

  it('deve rejeitar o cadastro se o e-mail já estiver em uso', async () => {
    authRepository.buscarPorEmail.mockResolvedValue({ id_usuario: 99 }); // já existe

    await expect(
      authService.cadastrar({
        nome: 'Outro Usuário',
        email: 'ana@universidade.edu.br',
        senha: '123456',
      })
    ).rejects.toThrow('E-mail já cadastrado');

    expect(authRepository.criar).not.toHaveBeenCalled();
  });
});