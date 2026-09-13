const usersService = require('./users.service');
const usersRepository = require('./users.repository');

jest.mock('./users.repository');

describe('UsersService - Editar Perfil Acadêmico (RF04)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve atualizar o curso e semestre do usuário', async () => {
    usersRepository.atualizarPerfil.mockResolvedValue({
      id_usuario: 1,
      nome: 'Ana Beatriz',
      curso: 'Engenharia de Software',
      semestre: 5,
    });

    const usuarioAtualizado = await usersService.atualizarPerfil(1, {
      curso: 'Engenharia de Software',
      semestre: 5,
    });

    expect(usuarioAtualizado.curso).toBe('Engenharia de Software');
    expect(usuarioAtualizado.semestre).toBe(5);
    expect(usersRepository.atualizarPerfil).toHaveBeenCalledWith(1, {
      curso: 'Engenharia de Software',
      semestre: 5,
    });
  });
});