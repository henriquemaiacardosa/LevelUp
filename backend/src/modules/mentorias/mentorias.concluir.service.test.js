jest.mock('./mentorias.repository');

const mentoriasRepository = require('./mentorias.repository');
const mentoriasService = require('./mentorias.service');

const passado = () => new Date(Date.now() - 60 * 60 * 1000);
const futuro = () => new Date(Date.now() + 60 * 60 * 1000);

const confirmada = () => ({
  id_mentoria: 1,
  id_aluno: 10,
  id_tutor: 20,
  status: 'CONFIRMADA',
  data_hora: passado(),
});

describe('MentoriasService - Concluir mentoria (RF14)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve concluir a mentoria e dar XP ao tutor (50) e ao aluno (20)', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(confirmada());
    mentoriasRepository.concluirComXp.mockResolvedValue({ id_mentoria: 1, status: 'CONCLUIDA' });

    const resultado = await mentoriasService.concluirMentoria({ id_mentoria: 1, id_usuario: 20 });

    expect(resultado.status).toBe('CONCLUIDA');
    expect(mentoriasRepository.concluirComXp).toHaveBeenCalledWith({
      id_mentoria: 1,
      id_tutor: 20,
      id_aluno: 10,
      xp_tutor: 50,
      xp_aluno: 20,
    });
  });

  it('deve retornar 404 se a mentoria não existir', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(null);

    await expect(
      mentoriasService.concluirMentoria({ id_mentoria: 99, id_usuario: 20 })
    ).rejects.toMatchObject({ status: 404 });

    expect(mentoriasRepository.concluirComXp).not.toHaveBeenCalled();
  });

  it('deve retornar 403 se quem pede não é o tutor da mentoria', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(confirmada());

    await expect(
      mentoriasService.concluirMentoria({ id_mentoria: 1, id_usuario: 10 })
    ).rejects.toMatchObject({ status: 403 });

    expect(mentoriasRepository.concluirComXp).not.toHaveBeenCalled();
  });

  it('deve retornar 409 se a mentoria não estiver CONFIRMADA', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue({ ...confirmada(), status: 'PENDENTE' });

    await expect(
      mentoriasService.concluirMentoria({ id_mentoria: 1, id_usuario: 20 })
    ).rejects.toMatchObject({ status: 409 });

    expect(mentoriasRepository.concluirComXp).not.toHaveBeenCalled();
  });

  it('deve retornar 409 se o horário da mentoria ainda não passou', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue({ ...confirmada(), data_hora: futuro() });

    await expect(
      mentoriasService.concluirMentoria({ id_mentoria: 1, id_usuario: 20 })
    ).rejects.toMatchObject({ status: 409 });

    expect(mentoriasRepository.concluirComXp).not.toHaveBeenCalled();
  });

  it('não deve dar XP se a mentoria já foi concluída (sem duplicar pontos)', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue({ ...confirmada(), status: 'CONCLUIDA' });

    await expect(
      mentoriasService.concluirMentoria({ id_mentoria: 1, id_usuario: 20 })
    ).rejects.toMatchObject({ status: 409 });

    expect(mentoriasRepository.concluirComXp).not.toHaveBeenCalled();
  });
});