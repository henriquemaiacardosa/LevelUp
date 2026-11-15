import { api, definirAoSessaoExpirar } from './api';
import { salvarToken, obterToken } from './tokenStorage';

function respostaErro(status, corpo) {
  return { ok: false, status, json: async () => corpo };
}

describe('api - sessão expirada (401)', () => {
  let aoExpirar;

  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = vi.fn();
    aoExpirar = vi.fn();
    definirAoSessaoExpirar(aoExpirar);
  });

  afterEach(() => {
    definirAoSessaoExpirar(null);
  });

  test('401 com token guardado limpa o token, avisa a sessão e ainda rejeita', async () => {
    salvarToken('token-vencido');
    globalThis.fetch.mockResolvedValue(respostaErro(401, { erro: 'Token inválido ou expirado.' }));

    await expect(api('/mentorias')).rejects.toMatchObject({ name: 'ApiError', status: 401 });

    expect(obterToken()).toBeNull();
    expect(aoExpirar).toHaveBeenCalledTimes(1);
  });

  test('401 sem token (credenciais inválidas no login) não avisa a sessão', async () => {
    globalThis.fetch.mockResolvedValue(respostaErro(401, { erro: 'Credenciais inválidas' }));

    await expect(
      api('/auth/login', { method: 'POST', body: { email: 'a@b.com', senha: 'x' } }),
    ).rejects.toMatchObject({ status: 401, message: 'Credenciais inválidas' });

    expect(aoExpirar).not.toHaveBeenCalled();
  });

  test('outros erros com token não derrubam a sessão', async () => {
    salvarToken('token-valido');
    globalThis.fetch.mockResolvedValue(respostaErro(500, { erro: 'Erro interno do servidor.' }));

    await expect(api('/mentorias')).rejects.toMatchObject({ status: 500 });

    expect(obterToken()).toBe('token-valido');
    expect(aoExpirar).not.toHaveBeenCalled();
  });
});