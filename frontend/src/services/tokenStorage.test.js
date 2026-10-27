import { salvarToken, obterToken, limparToken } from './tokenStorage';

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('sem token salvo devolve null', () => {
    expect(obterToken()).toBeNull();
  });

  test('salva e lê o token', () => {
    salvarToken('abc123');

    expect(obterToken()).toBe('abc123');
  });

  test('limpar remove o token', () => {
    salvarToken('abc123');

    limparToken();

    expect(obterToken()).toBeNull();
  });
});