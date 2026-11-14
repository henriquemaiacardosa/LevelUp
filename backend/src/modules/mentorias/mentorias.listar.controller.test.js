jest.mock('./mentorias.service');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const mentoriasService = require('./mentorias.service');

function tokenDoUsuario(id_usuario) {
  return jwt.sign({ id_usuario }, process.env.JWT_SECRET);
}

describe('GET /api/mentorias (minhas mentorias)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('401 sem token (RN01)', async () => {
    const resposta = await request(app).get('/api/mentorias');

    expect(resposta.status).toBe(401);
    expect(mentoriasService.listarMinhasMentorias).not.toHaveBeenCalled();
  });

  test('200 com a lista de mentorias do usuário do token', async () => {
    const lista = [
      {
        id_mentoria: 6,
        status: 'CONFIRMADA',
        data_hora: '2026-11-01T14:00:00.000Z',
        papel: 'TUTOR',
        outra_pessoa: { id_usuario: 12, nome: 'Aluno Teste' },
        disciplina: 'Cálculo I',
        link_videochamada: 'https://meet.google.com/abc',
      },
    ];
    mentoriasService.listarMinhasMentorias.mockResolvedValue(lista);

    const resposta = await request(app)
      .get('/api/mentorias')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual(lista);
    expect(mentoriasService.listarMinhasMentorias).toHaveBeenCalledWith({
      id_usuario: 11,
      status: undefined,
    });
  });

  test('repassa o filtro ?status= ao service', async () => {
    mentoriasService.listarMinhasMentorias.mockResolvedValue([]);

    await request(app)
      .get('/api/mentorias?status=PENDENTE')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(mentoriasService.listarMinhasMentorias).toHaveBeenCalledWith({
      id_usuario: 11,
      status: 'PENDENTE',
    });
  });

  test('ignora id_usuario enviado na query (vem só do token)', async () => {
    mentoriasService.listarMinhasMentorias.mockResolvedValue([]);

    await request(app)
      .get('/api/mentorias?id_usuario=99')
      .set('Authorization', `Bearer ${tokenDoUsuario(12)}`);

    expect(mentoriasService.listarMinhasMentorias).toHaveBeenCalledWith({
      id_usuario: 12,
      status: undefined,
    });
  });

  test('repassa o status de erro do service (400)', async () => {
    const erro = new Error('Status inválido.');
    erro.status = 400;
    mentoriasService.listarMinhasMentorias.mockRejectedValue(erro);

    const resposta = await request(app)
      .get('/api/mentorias?status=QUALQUER')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('Status inválido.');
  });

  test('500 genérico para erro inesperado, sem vazar detalhe', async () => {
    mentoriasService.listarMinhasMentorias.mockRejectedValue(
      new Error('falha no banco xyz')
    );

    const resposta = await request(app)
      .get('/api/mentorias')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(resposta.status).toBe(500);
    expect(JSON.stringify(resposta.body)).not.toContain('xyz');
  });
});