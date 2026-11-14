jest.mock('./mentorias.repository');

const mentoriasRepository = require('./mentorias.repository');
const { cancelarMentoria } = require('./mentorias.service');

const UMA_HORA = 60 * 60 * 1000;

function mentoria(campos = {}) {
  return {
    id_mentoria: 6,
    id_tutor: 11,
    id_aluno: 12,
    status: 'CONFIRMADA',
    data_hora: new Date(Date.now() + UMA_HORA),
    ...campos,
  };
}

describe('mentorias.service - cancelarMentoria (RF12)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('o tutor cancela uma mentoria confirmada futura', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(mentoria());
    mentoriasRepository.cancelarConfirmada.mockResolvedValue(
      mentoria({ status: 'CANCELADA' })
    );

    const resultado = await cancelarMentoria({ id_mentoria: 6, id_usuario: 11 });

    expect(mentoriasRepository.cancelarConfirmada).toHaveBeenCalledWith(6);
    expect(resultado.status).toBe('CANCELADA');
  });

  test('o aluno também pode cancelar', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(mentoria());
    mentoriasRepository.cancelarConfirmada.mockResolvedValue(
      mentoria({ status: 'CANCELADA' })
    );

    const resultado = await cancelarMentoria({ id_mentoria: 6, id_usuario: 12 });

    expect(mentoriasRepository.cancelarConfirmada).toHaveBeenCalledWith(6);
    expect(resultado.status).toBe('CANCELADA');
  });

  test('lança 404 se a mentoria não existe', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(null);

    await expect(
      cancelarMentoria({ id_mentoria: 999, id_usuario: 11 })
    ).rejects.toMatchObject({ status: 404 });

    expect(mentoriasRepository.cancelarConfirmada).not.toHaveBeenCalled();
  });

  test('lança 403 se quem pede não participa da mentoria', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(mentoria());

    await expect(
      cancelarMentoria({ id_mentoria: 6, id_usuario: 99 })
    ).rejects.toMatchObject({ status: 403 });

    expect(mentoriasRepository.cancelarConfirmada).not.toHaveBeenCalled();
  });

  test.each(['PENDENTE', 'CONCLUIDA', 'CANCELADA'])(
    'lança 409 se a mentoria está %s',
    async (status) => {
      mentoriasRepository.buscarPorId.mockResolvedValue(mentoria({ status }));

      await expect(
        cancelarMentoria({ id_mentoria: 6, id_usuario: 11 })
      ).rejects.toMatchObject({ status: 409 });

      expect(mentoriasRepository.cancelarConfirmada).not.toHaveBeenCalled();
    }
  );

  test('lança 409 se o horário da mentoria já passou', async () => {
    mentoriasRepository.buscarPorId.mockResolvedValue(
      mentoria({ data_hora: new Date(Date.now() - UMA_HORA) })
    );

    await expect(
      cancelarMentoria({ id_mentoria: 6, id_usuario: 11 })
    ).rejects.toMatchObject({ status: 409 });

    expect(mentoriasRepository.cancelarConfirmada).not.toHaveBeenCalled();
  });
});