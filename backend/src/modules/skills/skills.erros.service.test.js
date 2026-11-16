jest.mock('./skills.repository');

const skillsRepository = require('./skills.repository');
const skillsService = require('./skills.service');

function erroPrisma(code) {
  return Object.assign(new Error('erro do prisma'), { code });
}

describe.each([
  ['cadastrarOferta', 'OFERTA'],
  ['cadastrarDemanda', 'DEMANDA'],
])('SkillsService.%s - erros', (funcao, tipo) => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devolve 409 quando a disciplina já está cadastrada (P2002)', async () => {
    skillsRepository.criarHabilidade.mockRejectedValue(erroPrisma('P2002'));

    await expect(skillsService[funcao](10, 3)).rejects.toMatchObject({
      status: 409,
      message: 'Você já cadastrou esta disciplina nesta lista.',
    });
  });

  it('devolve 404 quando a disciplina não existe (P2003)', async () => {
    skillsRepository.criarHabilidade.mockRejectedValue(erroPrisma('P2003'));

    await expect(skillsService[funcao](10, 999)).rejects.toMatchObject({
      status: 404,
      message: 'Disciplina não encontrada.',
    });
  });

  it('não esconde erros inesperados (continuam sem status)', async () => {
    const falha = new Error('banco fora do ar');
    skillsRepository.criarHabilidade.mockRejectedValue(falha);

    await expect(skillsService[funcao](10, 3)).rejects.toBe(falha);
  });

  it.each([['abc'], [0], [-2], [1.5]])(
    'devolve 400 para id_disciplina inválido (%p) sem consultar o banco',
    async (valor) => {
      await expect(skillsService[funcao](10, valor)).rejects.toMatchObject({
        status: 400,
        message: 'Identificador da disciplina inválido.',
      });

      expect(skillsRepository.criarHabilidade).not.toHaveBeenCalled();
    }
  );

  it('aceita id_disciplina numérico em texto e grava como número', async () => {
    skillsRepository.criarHabilidade.mockResolvedValue({ id_habilidade: 1 });

    await skillsService[funcao](10, '3');

    expect(skillsRepository.criarHabilidade).toHaveBeenCalledWith({
      id_usuario: 10,
      id_disciplina: 3,
      tipo_habilidade: tipo,
    });
  });
});