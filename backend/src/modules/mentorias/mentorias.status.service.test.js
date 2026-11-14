jest.mock('./mentorias.repository');

const mentoriasRepository = require('./mentorias.repository');
const mentoriasService = require('./mentorias.service');

const pendente = { id_mentoria: 1, id_aluno: 10, id_tutor: 20, status: 'PENDENTE' };

describe('MentoriasService - Responder solicitação (RF11)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve confirmar a mentoria quando o tutor aceita', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(pendente);
    mentoriasRepository.atualizarStatus.mockResolvedValue({ ...pendente, status: 'CONFIRMADA' });

    const resultado = await mentoriasService.responderSolicitacao({
      id_mentoria: 1,
      id_usuario: 20,
      status: 'CONFIRMADA',
    });

    expect(resultado.status).toBe('CONFIRMADA');
    expect(mentoriasRepository.atualizarStatus).toHaveBeenCalledWith(1, 'CONFIRMADA');
  });

  it('deve cancelar a mentoria quando o tutor recusa', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(pendente);
    mentoriasRepository.atualizarStatus.mockResolvedValue({ ...pendente, status: 'CANCELADA' });

    const resultado = await mentoriasService.responderSolicitacao({
      id_mentoria: 1,
      id_usuario: 20,
      status: 'CANCELADA',
    });

    expect(resultado.status).toBe('CANCELADA');
    expect(mentoriasRepository.atualizarStatus).toHaveBeenCalledWith(1, 'CANCELADA');
  });

  it('deve rejeitar status diferente de CONFIRMADA ou CANCELADA', async () => {
    await expect(
      mentoriasService.responderSolicitacao({ id_mentoria: 1, id_usuario: 20, status: 'CONCLUIDA' })
    ).rejects.toMatchObject({ status: 400 });

    expect(mentoriasRepository.buscarPorId).not.toHaveBeenCalled();
    expect(mentoriasRepository.atualizarStatus).not.toHaveBeenCalled();
  });

  it('deve retornar 404 se a mentoria não existir', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(null);

    await expect(
      mentoriasService.responderSolicitacao({ id_mentoria: 99, id_usuario: 20, status: 'CONFIRMADA' })
    ).rejects.toMatchObject({ status: 404 });

    expect(mentoriasRepository.atualizarStatus).not.toHaveBeenCalled();
  });

  it('deve retornar 403 se quem pede não é o tutor da mentoria', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(pendente);

    await expect(
      mentoriasService.responderSolicitacao({ id_mentoria: 1, id_usuario: 10, status: 'CONFIRMADA' })
    ).rejects.toMatchObject({ status: 403 });

    expect(mentoriasRepository.atualizarStatus).not.toHaveBeenCalled();
  });

  it('deve retornar 409 se a mentoria não estiver PENDENTE', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue({ ...pendente, status: 'CONFIRMADA' });

    await expect(
      mentoriasService.responderSolicitacao({ id_mentoria: 1, id_usuario: 20, status: 'CANCELADA' })
    ).rejects.toMatchObject({ status: 409 });

    expect(mentoriasRepository.atualizarStatus).not.toHaveBeenCalled();
  });
});