jest.mock('./disponibilidade.repository');

const repository = require('./disponibilidade.repository');
const {
  listarMinhaDisponibilidade,
  salvarMinhaDisponibilidade,
} = require('./disponibilidade.service');

describe('disponibilidade.service - listarMinhaDisponibilidade', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('busca a disponibilidade do usuário informado', async () => {
    repository.listarPorUsuario.mockResolvedValue([]);

    await listarMinhaDisponibilidade(7);

    expect(repository.listarPorUsuario).toHaveBeenCalledWith(7);
  });

  test('devolve só dia e turno de cada item', async () => {
    repository.listarPorUsuario.mockResolvedValue([
      { id_disponibilidade: 1, id_usuario: 7, dia_semana: 'SEGUNDA', turno: 'NOITE' },
      { id_disponibilidade: 2, id_usuario: 7, dia_semana: 'SABADO', turno: 'MANHA' },
    ]);

    const resultado = await listarMinhaDisponibilidade(7);

    expect(resultado).toEqual({
      disponibilidade: [
        { dia_semana: 'SEGUNDA', turno: 'NOITE' },
        { dia_semana: 'SABADO', turno: 'MANHA' },
      ],
    });
  });

  test('sem registros devolve lista vazia', async () => {
    repository.listarPorUsuario.mockResolvedValue([]);

    const resultado = await listarMinhaDisponibilidade(7);

    expect(resultado).toEqual({ disponibilidade: [] });
  });
});

describe('disponibilidade.service - salvarMinhaDisponibilidade', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repository.substituirPorUsuario.mockResolvedValue();
  });

  test('substitui a disponibilidade do usuário e devolve o que foi salvo', async () => {
    const itens = [
      { dia_semana: 'SEGUNDA', turno: 'MANHA' },
      { dia_semana: 'SABADO', turno: 'TARDE' },
    ];

    const resultado = await salvarMinhaDisponibilidade(7, itens);

    expect(repository.substituirPorUsuario).toHaveBeenCalledWith(7, itens);
    expect(resultado).toEqual({ disponibilidade: itens });
  });

  test('lista vazia limpa a disponibilidade', async () => {
    const resultado = await salvarMinhaDisponibilidade(7, []);

    expect(repository.substituirPorUsuario).toHaveBeenCalledWith(7, []);
    expect(resultado).toEqual({ disponibilidade: [] });
  });

  test('remove itens duplicados antes de salvar', async () => {
    const resultado = await salvarMinhaDisponibilidade(7, [
      { dia_semana: 'SEGUNDA', turno: 'MANHA' },
      { dia_semana: 'SEGUNDA', turno: 'MANHA' },
      { dia_semana: 'SEGUNDA', turno: 'TARDE' },
    ]);

    expect(resultado.disponibilidade).toEqual([
      { dia_semana: 'SEGUNDA', turno: 'MANHA' },
      { dia_semana: 'SEGUNDA', turno: 'TARDE' },
    ]);
  });

  test('ignora campos extras dos itens (como id_usuario)', async () => {
    await salvarMinhaDisponibilidade(7, [
      { dia_semana: 'QUARTA', turno: 'NOITE', id_usuario: 99 },
    ]);

    expect(repository.substituirPorUsuario).toHaveBeenCalledWith(7, [
      { dia_semana: 'QUARTA', turno: 'NOITE' },
    ]);
  });

  test('rejeita quando a disponibilidade não é uma lista', async () => {
    await expect(salvarMinhaDisponibilidade(7, 'SEGUNDA')).rejects.toMatchObject({
      status: 400,
      message: 'Informe a lista de disponibilidade.',
    });
    expect(repository.substituirPorUsuario).not.toHaveBeenCalled();
  });

  test('rejeita dia da semana inválido', async () => {
    await expect(
      salvarMinhaDisponibilidade(7, [{ dia_semana: 'FERIADO', turno: 'MANHA' }])
    ).rejects.toMatchObject({ status: 400, message: 'Dia da semana inválido.' });
    expect(repository.substituirPorUsuario).not.toHaveBeenCalled();
  });

  test('rejeita turno inválido', async () => {
    await expect(
      salvarMinhaDisponibilidade(7, [{ dia_semana: 'SEGUNDA', turno: 'MADRUGADA' }])
    ).rejects.toMatchObject({ status: 400, message: 'Turno inválido.' });
    expect(repository.substituirPorUsuario).not.toHaveBeenCalled();
  });
});