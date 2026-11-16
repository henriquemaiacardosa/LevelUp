jest.mock('./health.service');
const healthService = require('./health.service');
const healthController = require('./health.controller');

function criarRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('healthController.verificar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('responde 200 com o corpo quando tudo esta ok', async () => {
    healthService.verificar.mockResolvedValue({ status: 'ok', banco: 'ok' });
    const res = criarRes();

    await healthController.verificar({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'ok', banco: 'ok' });
  });

  it('responde 503 com o corpo quando o banco esta indisponivel', async () => {
    healthService.verificar.mockResolvedValue({ status: 'erro', banco: 'indisponivel' });
    const res = criarRes();

    await healthController.verificar({}, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ status: 'erro', banco: 'indisponivel' });
  });
});