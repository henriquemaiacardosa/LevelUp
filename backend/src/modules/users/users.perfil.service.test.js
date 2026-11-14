jest.mock('./users.repository');

const usersRepository = require('./users.repository');
const { obterPerfil } = require('./users.service');

describe('users.service - obterPerfil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devolve os dados do perfil do usuário', async () => {
    usersRepository.buscarPerfilPorId.mockResolvedValue({
      id_usuario: 11,
      nome: 'Tutor Teste',
      email: 'tutor@teste.com',
      curso: 'Engenharia de Software',
      semestre: 7,
    });

    const resultado = await obterPerfil(11);

    expect(usersRepository.buscarPerfilPorId).toHaveBeenCalledWith(11);
    expect(resultado).toEqual({
      id_usuario: 11,
      nome: 'Tutor Teste',
      email: 'tutor@teste.com',
      curso: 'Engenharia de Software',
      semestre: 7,
    });
  });

  test('curso e semestre ainda não preenchidos vêm como null', async () => {
    usersRepository.buscarPerfilPorId.mockResolvedValue({
      id_usuario: 12,
      nome: 'Aluno Teste',
      email: 'aluno@teste.com',
      curso: null,
      semestre: null,
    });

    const resultado = await obterPerfil(12);

    expect(resultado.curso).toBeNull();
    expect(resultado.semestre).toBeNull();
  });

  test('nunca devolve campos além do perfil (ex.: senha_hash)', async () => {
    usersRepository.buscarPerfilPorId.mockResolvedValue({
      id_usuario: 11,
      nome: 'Tutor Teste',
      email: 'tutor@teste.com',
      curso: null,
      semestre: null,
      senha_hash: 'hash-secreto',
      xp_ensino: 50,
    });

    const resultado = await obterPerfil(11);

    expect(Object.keys(resultado).sort()).toEqual([
      'curso',
      'email',
      'id_usuario',
      'nome',
      'semestre',
    ]);
  });

  test('lança 404 se o usuário não existe', async () => {
    usersRepository.buscarPerfilPorId.mockResolvedValue(null);

    await expect(obterPerfil(999)).rejects.toMatchObject({ status: 404 });
  });
});