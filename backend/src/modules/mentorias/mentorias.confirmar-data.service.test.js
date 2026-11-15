jest.mock('./mentorias.repository');

const mentoriasRepository = require('./mentorias.repository');
const mentoriasService = require('./mentorias.service');

const UMA_HORA = 60 * 60 * 1000;

function pendenteEm(data_hora) {
  return { id_mentoria: 1, id_aluno: 10, id_tutor: 20, status: 'PENDENTE', data_hora };
}

describe('MentoriasService - Responder solicitação e a data da mentoria (RF11)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('recusa confirmar uma mentoria cuja data já passou (409)', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(pendenteEm(new Date(Date.now() - UMA_HORA)));

    await expect(
      mentoriasService.responderSolicitacao({ id_mentoria: 1, id_usuario: 20, status: 'CONFIRMADA' })
    ).rejects.toMatchObject({
      status: 409,
      message: 'Não é possível confirmar uma mentoria cuja data já passou.',
    });

    expect(mentoriasRepository.atualizarStatus).not.toHaveBeenCalled();
  });

  it('permite recusar uma mentoria pendente mesmo com a data passada', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(pendenteEm(new Date(Date.now() - UMA_HORA)));
    mentoriasRepository.atualizarStatus.mockResolvedValue({ id_mentoria: 1, status: 'CANCELADA' });

    const resultado = await mentoriasService.responderSolicitacao({
      id_mentoria: 1,
      id_usuario: 20,
      status: 'CANCELADA',
    });

    expect(resultado.status).toBe('CANCELADA');
    expect(mentoriasRepository.atualizarStatus).toHaveBeenCalledWith(1, 'CANCELADA');
  });

  it('permite confirmar uma mentoria pendente com data futura', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(pendenteEm(new Date(Date.now() + UMA_HORA)));
    mentoriasRepository.atualizarStatus.mockResolvedValue({ id_mentoria: 1, status: 'CONFIRMADA' });

    const resultado = await mentoriasService.responderSolicitacao({
      id_mentoria: 1,
      id_usuario: 20,
      status: 'CONFIRMADA',
    });

    expect(resultado.status).toBe('CONFIRMADA');
    expect(mentoriasRepository.atualizarStatus).toHaveBeenCalledWith(1, 'CONFIRMADA');
  });
});