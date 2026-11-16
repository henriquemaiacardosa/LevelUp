jest.mock('./users.service');

const usersService = require('./users.service');
const usersController = require('./users.controller');

function criarRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
}

const req = { usuario: { id_usuario: 10 } };

describe('UsersController.excluir (LGPD)', () => {
  let erroNoConsole;

  beforeEach(() => {
    jest.clearAllMocks();
    erroNoConsole = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    erroNoConsole.mockRestore();
  });

  it('exclui a conta do usuário do token e responde 204 sem corpo', async () => {
    usersService.excluirConta.mockResolvedValue();
    const res = criarRes();

    await usersController.excluir(req, res);

    expect(usersService.excluirConta).toHaveBeenCalledWith(10);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  it('repassa o status e a mensagem dos erros do serviço', async () => {
    const erro = Object.assign(new Error('Usuário não encontrado.'), { status: 404 });
    usersService.excluirConta.mockRejectedValue(erro);
    const res = criarRes();

    await usersController.excluir(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não encontrado.' });
  });

  it('responde 500 e registra no log quando o erro é inesperado', async () => {
    const falha = new Error('banco fora do ar');
    usersService.excluirConta.mockRejectedValue(falha);
    const res = criarRes();

    await usersController.excluir(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(erroNoConsole).toHaveBeenCalledWith(falha);
  });
});