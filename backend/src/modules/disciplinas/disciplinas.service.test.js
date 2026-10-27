jest.mock('./disciplinas.repository');

const disciplinasRepository = require('./disciplinas.repository');
const { listarDisciplinas } = require('./disciplinas.service');

describe('disciplinas.service - listarDisciplinas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devolve as disciplinas vindas do repository', async () => {
    const lista = [
      { id_disciplina: 1, nome_disciplina: 'Cálculo I', area_conhecimento: 'Exatas' },
      { id_disciplina: 2, nome_disciplina: 'Programação', area_conhecimento: null },
    ];
    disciplinasRepository.listarTodas.mockResolvedValue(lista);

    const resultado = await listarDisciplinas();

    expect(disciplinasRepository.listarTodas).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual(lista);
  });

  test('sem disciplinas cadastradas devolve lista vazia', async () => {
    disciplinasRepository.listarTodas.mockResolvedValue([]);

    const resultado = await listarDisciplinas();

    expect(resultado).toEqual([]);
  });
});