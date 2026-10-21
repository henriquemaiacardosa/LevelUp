jest.mock('./mentorias.repository');

const mentoriasRepository = require('./mentorias.repository');
const mentoriasService = require('./mentorias.service');

const confirmada = { id_mentoria: 1, id_aluno: 10, id_tutor: 20, status: 'CONFIRMADA', link_videochamada: null };
const link = 'https://meet.google.com/abc-defg-hij';

describe('MentoriasService - Definir link da videochamada (RF13)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve salvar o link quando o tutor informa uma URL válida em mentoria confirmada', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(confirmada);
    mentoriasRepository.atualizarLink.mockResolvedValue({ ...confirmada, link_videochamada: link });

    const resultado = await mentoriasService.definirLink({
      id_mentoria: 1,
      id_usuario: 20,
      link_videochamada: link,
    });

    expect(resultado.link_videochamada).toBe(link);
    expect(mentoriasRepository.atualizarLink).toHaveBeenCalledWith(1, link);
  });

  it('deve rejeitar link que não seja uma URL http ou https válida', async () => {
    await expect(
      mentoriasService.definirLink({ id_mentoria: 1, id_usuario: 20, link_videochamada: 'meet.google.com/abc' })
    ).rejects.toMatchObject({ status: 400 });

    await expect(
      mentoriasService.definirLink({ id_mentoria: 1, id_usuario: 20, link_videochamada: 'javascript:alert(1)' })
    ).rejects.toMatchObject({ status: 400 });

    expect(mentoriasRepository.buscarPorId).not.toHaveBeenCalled();
    expect(mentoriasRepository.atualizarLink).not.toHaveBeenCalled();
  });

  it('deve retornar 404 se a mentoria não existir', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(null);

    await expect(
      mentoriasService.definirLink({ id_mentoria: 99, id_usuario: 20, link_videochamada: link })
    ).rejects.toMatchObject({ status: 404 });

    expect(mentoriasRepository.atualizarLink).not.toHaveBeenCalled();
  });

  it('deve retornar 403 se quem pede não é o tutor da mentoria', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(confirmada);

    await expect(
      mentoriasService.definirLink({ id_mentoria: 1, id_usuario: 10, link_videochamada: link })
    ).rejects.toMatchObject({ status: 403 });

    expect(mentoriasRepository.atualizarLink).not.toHaveBeenCalled();
  });

  it('deve retornar 409 se a mentoria não estiver CONFIRMADA', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue({ ...confirmada, status: 'PENDENTE' });

    await expect(
      mentoriasService.definirLink({ id_mentoria: 1, id_usuario: 20, link_videochamada: link })
    ).rejects.toMatchObject({ status: 409 });

    expect(mentoriasRepository.atualizarLink).not.toHaveBeenCalled();
  });
});