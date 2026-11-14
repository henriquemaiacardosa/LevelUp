jest.mock('./skills.repository');

const skillsRepository = require('./skills.repository');
const skillsService = require('./skills.service');

describe('skills.service - removerHabilidade', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('remove a habilidade do próprio usuário', async () => {
    skillsRepository.removerDoUsuario.mockResolvedValue({ count: 1 });

    await skillsService.removerHabilidade(7, 15);

    expect(skillsRepository.removerDoUsuario).toHaveBeenCalledWith(7, 15);
  });

  it('aceita o identificador como texto numérico, como vem da URL', async () => {
    skillsRepository.removerDoUsuario.mockResolvedValue({ count: 1 });

    await skillsService.removerHabilidade(7, '15');

    expect(skillsRepository.removerDoUsuario).toHaveBeenCalledWith(7, 15);
  });

  it('devolve 404 quando a habilidade não existe ou não é do usuário', async () => {
    skillsRepository.removerDoUsuario.mockResolvedValue({ count: 0 });

    await expect(skillsService.removerHabilidade(7, 15)).rejects.toMatchObject({
      status: 404,
      message: 'Habilidade não encontrada.',
    });
  });

  it.each(['abc', '0', '-1', '1.5', ''])(
    'devolve 400 para identificador inválido (%p) sem consultar o banco',
    async (id) => {
      await expect(skillsService.removerHabilidade(7, id)).rejects.toMatchObject({
        status: 400,
        message: 'Identificador da habilidade inválido.',
      });

      expect(skillsRepository.removerDoUsuario).not.toHaveBeenCalled();
    },
  );
});