jest.mock('./mentorias.repository');

const mentoriasRepository = require('./mentorias.repository');
const { listarMinhasMentorias } = require('./mentorias.service');

function mentoria(campos = {}) {
  return {
    id_mentoria: 6,
    id_tutor: 11,
    id_aluno: 12,
    status: 'CONFIRMADA',
    data_hora: new Date('2026-11-01T14:00:00.000Z'),
    link_videochamada: 'https://meet.google.com/abc',
    tutor: { id_usuario: 11, nome: 'Tutor Teste' },
    aluno: { id_usuario: 12, nome: 'Aluno Teste' },
    disciplina: { nome_disciplina: 'Cálculo I' },
    ...campos,
  };
}

describe('mentorias.service - listarMinhasMentorias', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('como tutor: papel TUTOR e a outra pessoa é o aluno', async () => {
    mentoriasRepository.listarPorUsuario.mockResolvedValue([mentoria()]);

    const resultado = await listarMinhasMentorias({ id_usuario: 11 });

    expect(resultado).toEqual([
      {
        id_mentoria: 6,
        status: 'CONFIRMADA',
        data_hora: new Date('2026-11-01T14:00:00.000Z'),
        papel: 'TUTOR',
        outra_pessoa: { id_usuario: 12, nome: 'Aluno Teste' },
        disciplina: 'Cálculo I',
        link_videochamada: 'https://meet.google.com/abc',
      },
    ]);
  });

  test('como aluno: papel ALUNO e a outra pessoa é o tutor', async () => {
    mentoriasRepository.listarPorUsuario.mockResolvedValue([mentoria()]);

    const resultado = await listarMinhasMentorias({ id_usuario: 12 });

    expect(resultado[0].papel).toBe('ALUNO');
    expect(resultado[0].outra_pessoa).toEqual({
      id_usuario: 11,
      nome: 'Tutor Teste',
    });
  });

  test('o link só aparece quando a mentoria está CONFIRMADA', async () => {
    mentoriasRepository.listarPorUsuario.mockResolvedValue([
      mentoria({ id_mentoria: 1, status: 'CONFIRMADA' }),
      mentoria({ id_mentoria: 2, status: 'PENDENTE' }),
      mentoria({ id_mentoria: 3, status: 'CONCLUIDA' }),
      mentoria({ id_mentoria: 4, status: 'CANCELADA' }),
    ]);

    const resultado = await listarMinhasMentorias({ id_usuario: 12 });

    expect(resultado[0].link_videochamada).toBe('https://meet.google.com/abc');
    expect(resultado[1].link_videochamada).toBeNull();
    expect(resultado[2].link_videochamada).toBeNull();
    expect(resultado[3].link_videochamada).toBeNull();
  });

  test('repassa o id do usuário e o filtro de status ao repository', async () => {
    mentoriasRepository.listarPorUsuario.mockResolvedValue([]);

    await listarMinhasMentorias({ id_usuario: 11, status: 'PENDENTE' });

    expect(mentoriasRepository.listarPorUsuario).toHaveBeenCalledWith({
      id_usuario: 11,
      status: 'PENDENTE',
    });
  });

  test('sem filtro, chama o repository com status indefinido', async () => {
    mentoriasRepository.listarPorUsuario.mockResolvedValue([]);

    await listarMinhasMentorias({ id_usuario: 11 });

    expect(mentoriasRepository.listarPorUsuario).toHaveBeenCalledWith({
      id_usuario: 11,
      status: undefined,
    });
  });

  test('status inválido lança 400 e nem consulta o banco', async () => {
    await expect(
      listarMinhasMentorias({ id_usuario: 11, status: 'QUALQUER' })
    ).rejects.toMatchObject({ status: 400 });

    expect(mentoriasRepository.listarPorUsuario).not.toHaveBeenCalled();
  });

  test('sem mentorias devolve lista vazia', async () => {
    mentoriasRepository.listarPorUsuario.mockResolvedValue([]);

    const resultado = await listarMinhasMentorias({ id_usuario: 11 });

    expect(resultado).toEqual([]);
  });

  test('não expõe ids soltos de tutor/aluno nem e-mail', async () => {
    mentoriasRepository.listarPorUsuario.mockResolvedValue([mentoria()]);

    const resultado = await listarMinhasMentorias({ id_usuario: 11 });

    expect(Object.keys(resultado[0]).sort()).toEqual([
      'data_hora',
      'disciplina',
      'id_mentoria',
      'link_videochamada',
      'outra_pessoa',
      'papel',
      'status',
    ]);
  });
});