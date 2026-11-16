jest.mock('./health.repository');
const healthRepository = require('./health.repository');
const healthService = require('./health.service');

describe('healthService.verificar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('retorna status ok quando o banco responde', async () => {
    healthRepository.consultarBanco.mockResolvedValue(true);

    const resultado = await healthService.verificar();

    expect(resultado).toEqual({ status: 'ok', banco: 'ok' });
  });

  it('retorna status erro, sem detalhes, quando o banco falha', async () => {
    healthRepository.consultarBanco.mockRejectedValue(new Error('acesso negado para 10.0.0.5'));

    const resultado = await healthService.verificar();

    expect(resultado).toEqual({ status: 'erro', banco: 'indisponivel' });
    expect(JSON.stringify(resultado)).not.toContain('10.0.0.5');
  });

  it('registra o erro no log quando o banco falha', async () => {
    const erro = new Error('falha de conexao');
    healthRepository.consultarBanco.mockRejectedValue(erro);

    await healthService.verificar();

    expect(console.error).toHaveBeenCalledWith(erro);
  });
});