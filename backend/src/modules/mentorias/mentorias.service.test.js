jest.mock('./mentorias.repository');

const mentoriasRepository = require('./mentorias.repository');
const mentoriasService = require('./mentorias.service');

const amanha = () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
const ontem = () => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

describe('MentoriasService - Solicitar mentoria (RF10)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar a mentoria PENDENTE quando os dados são válidos', async () => {
    const criada = { id_mentoria: 1, id_aluno: 10, id_tutor: 20, id_disciplina: 5, status: 'PENDENTE' };
    mentoriasRepository.tutorOfereceDisciplina.mockResolvedValue(true);
    mentoriasRepository.criarMentoria.mockResolvedValue(criada);

    const resultado = await mentoriasService.solicitarMentoria({
      id_aluno: 10,
      id_tutor: 20,
      id_disciplina: 5,
      data_hora: amanha(),
    });

    expect(resultado).toEqual(criada);
    expect(mentoriasRepository.criarMentoria).toHaveBeenCalledWith(
      expect.objectContaining({
        id_aluno: 10,
        id_tutor: 20,
        id_disciplina: 5,
        data_hora: expect.any(Date),
      })
    );
  });

  it('deve rejeitar agendamento consigo mesmo (RN04)', async () => {
    await expect(
      mentoriasService.solicitarMentoria({
        id_aluno: 10,
        id_tutor: 10,
        id_disciplina: 5,
        data_hora: amanha(),
      })
    ).rejects.toThrow('consigo mesmo');

    expect(mentoriasRepository.criarMentoria).not.toHaveBeenCalled();
  });

  it('deve rejeitar data_hora no passado', async () => {
    await expect(
      mentoriasService.solicitarMentoria({
        id_aluno: 10,
        id_tutor: 20,
        id_disciplina: 5,
        data_hora: ontem(),
      })
    ).rejects.toThrow('passado');

    expect(mentoriasRepository.criarMentoria).not.toHaveBeenCalled();
  });

  it('deve rejeitar data_hora inválida', async () => {
    await expect(
      mentoriasService.solicitarMentoria({
        id_aluno: 10,
        id_tutor: 20,
        id_disciplina: 5,
        data_hora: 'abc',
      })
    ).rejects.toThrow('inválida');

    expect(mentoriasRepository.criarMentoria).not.toHaveBeenCalled();
  });

  it('deve rejeitar se o tutor não oferece a disciplina', async () => {
    mentoriasRepository.tutorOfereceDisciplina.mockResolvedValue(false);

    await expect(
      mentoriasService.solicitarMentoria({
        id_aluno: 10,
        id_tutor: 20,
        id_disciplina: 5,
        data_hora: amanha(),
      })
    ).rejects.toThrow('não oferece');

    expect(mentoriasRepository.criarMentoria).not.toHaveBeenCalled();
  });
});