const { gerarHash, compararSenha } = require('./hash');

describe('Utilitário de Hash de Senha (bcrypt)', () => {
  it('deve gerar um hash diferente da senha original', async () => {
    const senha = 'minhaSenha123';
    const hash = await gerarHash(senha);

    expect(hash).not.toBe(senha);
    expect(typeof hash).toBe('string');
  });

  it('deve confirmar que a senha correta bate com o hash gerado', async () => {
    const senha = 'minhaSenha123';
    const hash = await gerarHash(senha);

    const resultado = await compararSenha(senha, hash);
    expect(resultado).toBe(true);
  });

  it('deve rejeitar uma senha incorreta', async () => {
    const senha = 'minhaSenha123';
    const hash = await gerarHash(senha);

    const resultado = await compararSenha('senhaErrada', hash);
    expect(resultado).toBe(false);
  });
});