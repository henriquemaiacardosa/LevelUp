const skillsService = require('./skills.service');
const skillsRepository = require('./skills.repository');

jest.mock('./skills.repository');

describe('SkillsService - Cadastrar Demanda (RF05)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve cadastrar uma disciplina como Demanda para o usuário', async () => {
    skillsRepository.criarHabilidade.mockResolvedValue({
      id_habilidade: 1,
      id_usuario: 10,
      id_disciplina: 3,
      tipo_habilidade: 'DEMANDA',
    });

    const resultado = await skillsService.cadastrarDemanda(10, 3);

    expect(resultado.tipo_habilidade).toBe('DEMANDA');
    expect(skillsRepository.criarHabilidade).toHaveBeenCalledWith({
      id_usuario: 10,
      id_disciplina: 3,
      tipo_habilidade: 'DEMANDA',
    });
  });
});