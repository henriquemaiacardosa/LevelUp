jest.mock('./mentorias.service');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const mentoriasService = require('./mentorias.service');

function tokenDoUsuario(id_usuario) {
  return jwt.sign({ id_usuario }, process.env.JWT_SECRET);
}

describe('PATCH /api/mentorias/:id/cancelar (RF12)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('401 sem token (RN01)', async () => {
    const resposta = await request(app).patch('/api/mentorias/6/cancelar');

    expect(resposta.status).toBe(401);
    expect(mentoriasService.cancelarMentoria).not.toHaveBeenCalled();
  });

  test('200 com a mentoria cancelada', async () => {
    mentoriasService.cancelarMentoria.mockResolvedValue({
      id_mentoria: 6,
      status: 'CANCELADA',
    });

    const resposta = await request(app)
      .patch('/api/mentorias/6/cancelar')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.status).toBe('CANCELADA');
    expect(mentoriasService.cancelarMentoria).toHaveBeenCalledWith({
      id_mentoria: 6,
      id_usuario: 11,
    });
  });

  test.each(['abc', '0', '-3', '1.5'])(
    '400 para id inválido (%s), sem chamar o service',
    async (id) => {
      const resposta = await request(app)
        .patch(`/api/mentorias/${id}/cancelar`)
        .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

      expect(resposta.status).toBe(400);
      expect(mentoriasService.cancelarMentoria).not.toHaveBeenCalled();
    }
  );

  test.each([
    [403, 'Apenas o tutor ou o aluno da mentoria pode cancelá-la.'],
    [404, 'Mentoria não encontrada.'],
    [409, 'Só é possível cancelar mentorias confirmadas.'],
  ])('repassa o status %i do service', async (status, mensagem) => {
    const erro = new Error(mensagem);
    erro.status = status;
    mentoriasService.cancelarMentoria.mockRejectedValue(erro);

    const resposta = await request(app)
      .patch('/api/mentorias/6/cancelar')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(resposta.status).toBe(status);
    expect(resposta.body.erro).toBe(mensagem);
  });

  test('500 genérico para erro inesperado, sem vazar detalhe', async () => {
    mentoriasService.cancelarMentoria.mockRejectedValue(
      new Error('falha no banco xyz')
    );

    const resposta = await request(app)
      .patch('/api/mentorias/6/cancelar')
      .set('Authorization', `Bearer ${tokenDoUsuario(11)}`);

    expect(resposta.status).toBe(500);
    expect(JSON.stringify(resposta.body)).not.toContain('xyz');
  });
});