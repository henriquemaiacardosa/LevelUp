jest.mock('./users.repository');

const usersRepository = require('./users.repository');
const usersService = require('./users.service');

const perfil = { id_usuario: 10, nome: 'Ana', email: 'ana@exemplo.com', curso: 'ES', semestre: 3 };

describe('UsersService.excluirConta (LGPD)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devolve 404 quando o usuário não existe e não anonimiza nada', async () => {
    usersRepository.buscarPerfilPorId.mockResolvedValue(null);

    await expect(usersService.excluirConta(10)).rejects.toMatchObject({
      status: 404,
      message: 'Usuário não encontrado.',
    });

    expect(usersRepository.anonimizarUsuario).not.toHaveBeenCalled();
  });

  it('anonimiza o usuário com nome genérico, e-mail inválido único e senha inutilizável', async () => {
    usersRepository.buscarPerfilPorId.mockResolvedValue(perfil);
    usersRepository.anonimizarUsuario.mockResolvedValue({ id_usuario: 10 });

    await usersService.excluirConta(10);

    expect(usersRepository.anonimizarUsuario).toHaveBeenCalledTimes(1);
    expect(usersRepository.anonimizarUsuario).toHaveBeenCalledWith(10, {
      nome: 'Usuário removido',
      email: 'removido-10@levelup.invalid',
      senha_hash: expect.stringMatching(/^[0-9a-f]{64}$/),
    });
  });

  it('gera uma senha inutilizável diferente a cada exclusão', async () => {
    usersRepository.buscarPerfilPorId.mockResolvedValue(perfil);
    usersRepository.anonimizarUsuario.mockResolvedValue({ id_usuario: 10 });

    await usersService.excluirConta(10);
    await usersService.excluirConta(10);

    const primeira = usersRepository.anonimizarUsuario.mock.calls[0][1].senha_hash;
    const segunda = usersRepository.anonimizarUsuario.mock.calls[1][1].senha_hash;
    expect(primeira).not.toBe(segunda);
  });

  it('não esconde falhas do banco', async () => {
    const falha = new Error('banco fora do ar');
    usersRepository.buscarPerfilPorId.mockResolvedValue(perfil);
    usersRepository.anonimizarUsuario.mockRejectedValue(falha);

    await expect(usersService.excluirConta(10)).rejects.toBe(falha);
  });
});