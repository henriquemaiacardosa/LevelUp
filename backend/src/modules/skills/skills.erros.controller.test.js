jest.mock('./skills.service');

const skillsService = require('./skills.service');
const skillsController = require('./skills.controller');

function criarRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const req = { usuario: { id_usuario: 10 }, body: { id_disciplina: 3 } };

describe.each([['cadastrarOferta'], ['cadastrarDemanda']])(
  'SkillsController.%s - erros',
  (funcao) => {
    let erroNoConsole;

    beforeEach(() => {
      jest.clearAllMocks();
      erroNoConsole = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      erroNoConsole.mockRestore();
    });

    it('repassa o status e a mensagem dos erros do serviço', async () => {
      const erro = Object.assign(new Error('Você já cadastrou esta disciplina nesta lista.'), {
        status: 409,
      });
      skillsService[funcao].mockRejectedValue(erro);
      const res = criarRes();

      await skillsController[funcao](req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Você já cadastrou esta disciplina nesta lista.' });
    });

    it('responde 500 e registra no log quando o erro é inesperado', async () => {
      const falha = new Error('banco fora do ar');
      skillsService[funcao].mockRejectedValue(falha);
      const res = criarRes();

      await skillsController[funcao](req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(erroNoConsole).toHaveBeenCalledWith(falha);
    });
  }
);