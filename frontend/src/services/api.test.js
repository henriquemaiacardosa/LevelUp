import { api, ApiError } from './api';
import { salvarToken } from './tokenStorage';

function respostaOk(corpo, status = 200) {
  return { ok: true, status, json: async () => corpo };
}

function respostaErro(status, corpo) {
  return { ok: false, status, json: async () => corpo };
}

describe('api', () => {
  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = vi.fn();
  });

  test('GET chama a URL base + caminho e devolve o JSON', async () => {
    globalThis.fetch.mockResolvedValue(respostaOk([{ id_disciplina: 1 }]));

    const resultado = await api('/disciplinas');

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, opcoes] = globalThis.fetch.mock.calls[0];
    expect(url).toBe('http://localhost:3000/api/disciplinas');
    expect(opcoes.method).toBe('GET');
    expect(resultado).toEqual([{ id_disciplina: 1 }]);
  });

  test('sem token não manda o header Authorization', async () => {
    globalThis.fetch.mockResolvedValue(respostaOk({}));

    await api('/disciplinas');

    const [, opcoes] = globalThis.fetch.mock.calls[0];
    expect(opcoes.headers.Authorization).toBeUndefined();
  });

  test('com token salvo manda Authorization: Bearer', async () => {
    salvarToken('abc123');
    globalThis.fetch.mockResolvedValue(respostaOk({}));

    await api('/mentorias');

    const [, opcoes] = globalThis.fetch.mock.calls[0];
    expect(opcoes.headers.Authorization).toBe('Bearer abc123');
  });

  test('POST envia o corpo como JSON com Content-Type', async () => {
    globalThis.fetch.mockResolvedValue(respostaOk({ token: 't' }));

    await api('/auth/login', {
      method: 'POST',
      body: { email: 'a@b.com', senha: 'x' },
    });

    const [, opcoes] = globalThis.fetch.mock.calls[0];
    expect(opcoes.method).toBe('POST');
    expect(opcoes.headers['Content-Type']).toBe('application/json');
    expect(opcoes.body).toBe(JSON.stringify({ email: 'a@b.com', senha: 'x' }));
  });

  test('resposta de erro vira ApiError com status e a mensagem do backend', async () => {
    globalThis.fetch.mockResolvedValue(
      respostaErro(409, { erro: 'Só é possível cancelar mentorias confirmadas.' })
    );

    await expect(api('/mentorias/6/cancelar', { method: 'PATCH' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      message: 'Só é possível cancelar mentorias confirmadas.',
    });
  });

  test('erro sem corpo JSON usa uma mensagem padrão', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('sem corpo');
      },
    });

    await expect(api('/leaderboard')).rejects.toMatchObject({
      status: 500,
      message: 'Erro inesperado. Tente novamente.',
    });
  });

  test('servidor fora do ar vira ApiError amigável com status 0', async () => {
    globalThis.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

    const promessa = api('/leaderboard');

    await expect(promessa).rejects.toBeInstanceOf(ApiError);
    await expect(promessa).rejects.toMatchObject({
      status: 0,
      message: 'Não foi possível conectar ao servidor.',
    });
  });
});