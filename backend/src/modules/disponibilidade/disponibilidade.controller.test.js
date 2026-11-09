jest.mock('./disponibilidade.service');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const disponibilidadeService = require('./disponibilidade.service');

function gerarToken(id_usuario) {
  return jwt.sign({ id_usuario }, process.env.JWT_SECRET);
}

describe('GET /api/disponibilidade', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sem token devolve 401', async () => {
    const res = await request(app).get('/api/disponibilidade');

    expect(res.status).toBe(401);
    expect(disponibilidadeService.listarMinhaDisponibilidade).not.toHaveBeenCalled();
  });

  test('com token devolve 200 e a disponibilidade do usuário do token', async () => {
    const resposta = { disponibilidade: [{ dia_semana: 'SEGUNDA', turno: 'NOITE' }] };
    disponibilidadeService.listarMinhaDisponibilidade.mockResolvedValue(resposta);

    const res = await request(app)
      .get('/api/disponibilidade')
      .set('Authorization', `Bearer ${gerarToken(7)}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(resposta);
    expect(disponibilidadeService.listarMinhaDisponibilidade).toHaveBeenCalledWith(7);
  });

  test('erro de negócio devolve o status e a mensagem do service', async () => {
    const erro = new Error('Usuário não encontrado.');
    erro.status = 404;
    disponibilidadeService.listarMinhaDisponibilidade.mockRejectedValue(erro);

    const res = await request(app)
      .get('/api/disponibilidade')
      .set('Authorization', `Bearer ${gerarToken(7)}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ erro: 'Usuário não encontrado.' });
  });

  test('erro inesperado devolve 500 sem detalhes internos', async () => {
    disponibilidadeService.listarMinhaDisponibilidade.mockRejectedValue(
      new Error('falha do banco')
    );

    const res = await request(app)
      .get('/api/disponibilidade')
      .set('Authorization', `Bearer ${gerarToken(7)}`);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ erro: 'Erro interno do servidor.' });
  });
});

describe('PUT /api/disponibilidade', () => {
  const corpo = {
    disponibilidade: [
      { dia_semana: 'SEGUNDA', turno: 'MANHA' },
      { dia_semana: 'SABADO', turno: 'TARDE' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sem token devolve 401', async () => {
    const res = await request(app).put('/api/disponibilidade').send(corpo);

    expect(res.status).toBe(401);
    expect(disponibilidadeService.salvarMinhaDisponibilidade).not.toHaveBeenCalled();
  });

  test('com token salva e devolve 200 com o que foi gravado', async () => {
    disponibilidadeService.salvarMinhaDisponibilidade.mockResolvedValue(corpo);

    const res = await request(app)
      .put('/api/disponibilidade')
      .set('Authorization', `Bearer ${gerarToken(7)}`)
      .send(corpo);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(corpo);
    expect(disponibilidadeService.salvarMinhaDisponibilidade).toHaveBeenCalledWith(
      7,
      corpo.disponibilidade
    );
  });

  test('ignora id_usuario enviado no corpo e usa o do token', async () => {
    disponibilidadeService.salvarMinhaDisponibilidade.mockResolvedValue(corpo);

    await request(app)
      .put('/api/disponibilidade')
      .set('Authorization', `Bearer ${gerarToken(7)}`)
      .send({ ...corpo, id_usuario: 99 });

    expect(disponibilidadeService.salvarMinhaDisponibilidade).toHaveBeenCalledWith(
      7,
      corpo.disponibilidade
    );
  });

  test('erro de validação do service devolve 400 com a mensagem', async () => {
    const erro = new Error('Turno inválido.');
    erro.status = 400;
    disponibilidadeService.salvarMinhaDisponibilidade.mockRejectedValue(erro);

    const res = await request(app)
      .put('/api/disponibilidade')
      .set('Authorization', `Bearer ${gerarToken(7)}`)
      .send(corpo);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ erro: 'Turno inválido.' });
  });

  test('erro inesperado devolve 500 sem detalhes internos', async () => {
    disponibilidadeService.salvarMinhaDisponibilidade.mockRejectedValue(
      new Error('falha do banco')
    );

    const res = await request(app)
      .put('/api/disponibilidade')
      .set('Authorization', `Bearer ${gerarToken(7)}`)
      .send(corpo);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ erro: 'Erro interno do servidor.' });
  });
});

describe('PUT /api/disponibilidade - sem corpo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sem corpo repassa undefined ao service e devolve o 400 dele', async () => {
    const erro = new Error('Informe a lista de disponibilidade.');
    erro.status = 400;
    disponibilidadeService.salvarMinhaDisponibilidade.mockRejectedValue(erro);

    const res = await request(app)
      .put('/api/disponibilidade')
      .set('Authorization', `Bearer ${gerarToken(7)}`);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ erro: 'Informe a lista de disponibilidade.' });
    expect(disponibilidadeService.salvarMinhaDisponibilidade).toHaveBeenCalledWith(
      7,
      undefined
    );
  });
});

describe('disponibilidade.controller - registro de erros', () => {
  let consoleErro;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErro = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErro.mockRestore();
  });

  test('GET registra o erro inesperado antes de devolver 500', async () => {
    const falha = new Error('falha do banco');
    disponibilidadeService.listarMinhaDisponibilidade.mockRejectedValue(falha);

    const res = await request(app)
      .get('/api/disponibilidade')
      .set('Authorization', `Bearer ${gerarToken(7)}`);

    expect(res.status).toBe(500);
    expect(consoleErro).toHaveBeenCalledWith(falha);
  });

  test('PUT registra o erro inesperado antes de devolver 500', async () => {
    const falha = new Error('falha do banco');
    disponibilidadeService.salvarMinhaDisponibilidade.mockRejectedValue(falha);

    const res = await request(app)
      .put('/api/disponibilidade')
      .set('Authorization', `Bearer ${gerarToken(7)}`)
      .send({ disponibilidade: [] });

    expect(res.status).toBe(500);
    expect(consoleErro).toHaveBeenCalledWith(falha);
  });

  test('erro de negócio (com status) não é registrado como erro do servidor', async () => {
    const erro = new Error('Turno inválido.');
    erro.status = 400;
    disponibilidadeService.salvarMinhaDisponibilidade.mockRejectedValue(erro);

    await request(app)
      .put('/api/disponibilidade')
      .set('Authorization', `Bearer ${gerarToken(7)}`)
      .send({ disponibilidade: [] });

    expect(consoleErro).not.toHaveBeenCalled();
  });
});