jest.mock('./skills.repository');

const skillsRepository = require('./skills.repository');
const { listarMinhasHabilidades } = require('./skills.service');

function habilidade(id_habilidade, tipo_habilidade, id_disciplina, nome_disciplina) {
  return {
    id_habilidade,
    tipo_habilidade,
    disciplina: { id_disciplina, nome_disciplina },
  };
}

describe('skills.service - listarMinhasHabilidades', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('busca as habilidades do usuário informado', async () => {
    skillsRepository.listarPorUsuario.mockResolvedValue([]);

    await listarMinhasHabilidades(7);

    expect(skillsRepository.listarPorUsuario).toHaveBeenCalledWith(7);
  });

  test('separa oferta e demanda e devolve só os campos necessários', async () => {
    skillsRepository.listarPorUsuario.mockResolvedValue([
      habilidade(1, 'OFERTA', 3, 'Cálculo I'),
      habilidade(2, 'DEMANDA', 5, 'Física'),
      habilidade(3, 'OFERTA', 4, 'Programação'),
    ]);

    const resultado = await listarMinhasHabilidades(7);

    expect(resultado).toEqual({
      oferta: [
        { id_habilidade: 1, id_disciplina: 3, nome_disciplina: 'Cálculo I' },
        { id_habilidade: 3, id_disciplina: 4, nome_disciplina: 'Programação' },
      ],
      demanda: [{ id_habilidade: 2, id_disciplina: 5, nome_disciplina: 'Física' }],
    });
  });

  test('sem habilidades devolve as duas listas vazias', async () => {
    skillsRepository.listarPorUsuario.mockResolvedValue([]);

    const resultado = await listarMinhasHabilidades(7);

    expect(resultado).toEqual({ oferta: [], demanda: [] });
  });
});