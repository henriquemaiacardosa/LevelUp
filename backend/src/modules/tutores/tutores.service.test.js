jest.mock('./tutores.repository');

const tutoresRepository = require('./tutores.repository');
const { obterDetalhesTutor } = require('./tutores.service');

function tutor(sobrescrever = {}) {
  return {
    id_usuario: 12,
    nome: 'Maria',
    curso: 'Engenharia de Software',
    semestre: 5,
    xp_ensino: 150,
    xp_aprendizado: 20,
    habilidades: [{ disciplina: { id_disciplina: 3, nome_disciplina: 'Cálculo I' } }],
    disponibilidades: [{ dia_semana: 'SEGUNDA', turno: 'NOITE' }],
    ...sobrescrever,
  };
}

describe('tutores.service - obterDetalhesTutor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('busca o tutor pelo id numérico', async () => {
    tutoresRepository.buscarTutorPorId.mockResolvedValue(tutor());

    await obterDetalhesTutor(7, '12');

    expect(tutoresRepository.buscarTutorPorId).toHaveBeenCalledWith(12);
  });

  test('devolve perfil, pontuação, disciplinas e disponibilidade, sem dados sensíveis', async () => {
    tutoresRepository.buscarTutorPorId.mockResolvedValue(
      tutor({ email: 'maria@teste.com', senha_hash: 'x' })
    );

    const resultado = await obterDetalhesTutor(7, 12);

    expect(resultado).toEqual({
      id_usuario: 12,
      nome: 'Maria',
      curso: 'Engenharia de Software',
      semestre: 5,
      xp_ensino: 150,
      xp_total: 170,
      nivel: 2,
      disciplinas: [{ id_disciplina: 3, nome_disciplina: 'Cálculo I' }],
      disponibilidade: [{ dia_semana: 'SEGUNDA', turno: 'NOITE' }],
    });
  });

  test.each([
    [0, 0, 1],
    [60, 39, 1],
    [60, 40, 2],
  ])('xp de ensino %i e de aprendizado %i dá nível %i', async (xp_ensino, xp_aprendizado, nivel) => {
    tutoresRepository.buscarTutorPorId.mockResolvedValue(tutor({ xp_ensino, xp_aprendizado }));

    const resultado = await obterDetalhesTutor(7, 12);

    expect(resultado.xp_total).toBe(xp_ensino + xp_aprendizado);
    expect(resultado.nivel).toBe(nivel);
  });

  test('curso e semestre nulos continuam nulos', async () => {
    tutoresRepository.buscarTutorPorId.mockResolvedValue(tutor({ curso: null, semestre: null }));

    const resultado = await obterDetalhesTutor(7, 12);

    expect(resultado.curso).toBeNull();
    expect(resultado.semestre).toBeNull();
  });

  test('tutor sem horários devolve disponibilidade vazia', async () => {
    tutoresRepository.buscarTutorPorId.mockResolvedValue(tutor({ disponibilidades: [] }));

    const resultado = await obterDetalhesTutor(7, 12);

    expect(resultado.disponibilidade).toEqual([]);
  });

  test.each(['abc', '0', '-3', '1.5'])('rejeita o identificador inválido "%s"', async (id) => {
    await expect(obterDetalhesTutor(7, id)).rejects.toMatchObject({
      status: 400,
      message: 'Identificador do tutor inválido.',
    });
    expect(tutoresRepository.buscarTutorPorId).not.toHaveBeenCalled();
  });

  test('não deixa o usuário ver os detalhes de si mesmo (RN04)', async () => {
    await expect(obterDetalhesTutor(12, '12')).rejects.toMatchObject({
      status: 400,
      message: 'Você não pode ver os detalhes de si mesmo.',
    });
    expect(tutoresRepository.buscarTutorPorId).not.toHaveBeenCalled();
  });

  test('usuário inexistente devolve 404', async () => {
    tutoresRepository.buscarTutorPorId.mockResolvedValue(null);

    await expect(obterDetalhesTutor(7, 99)).rejects.toMatchObject({
      status: 404,
      message: 'Tutor não encontrado.',
    });
  });

  test('usuário que não ensina nenhuma disciplina não é tutor (404)', async () => {
    tutoresRepository.buscarTutorPorId.mockResolvedValue(tutor({ habilidades: [] }));

    await expect(obterDetalhesTutor(7, 12)).rejects.toMatchObject({
      status: 404,
      message: 'Tutor não encontrado.',
    });
  });
});