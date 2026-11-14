const { gerarToken, verificarToken } = require('./jwt');

describe('Utilitário de Token JWT', () => {
  it('deve gerar um token no formato string', () => {
    const token = gerarToken({ id_usuario: 1 });
    expect(typeof token).toBe('string');
  });

  it('deve conseguir decodificar um token válido e recuperar o payload', () => {
    const token = gerarToken({ id_usuario: 42 });
    const payload = verificarToken(token);

    expect(payload.id_usuario).toBe(42);
  });

  it('deve lançar um erro ao tentar verificar um token inválido', () => {
    expect(() => {
      verificarToken('token-falso-e-invalido');
    }).toThrow();
  });
});