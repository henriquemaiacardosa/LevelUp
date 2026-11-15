jest.mock('./auth/auth.service');
jest.mock('./disciplinas/disciplinas.service');
jest.mock('./leaderboard/leaderboard.service');
jest.mock('./matchmaking/matchmaking.service');
jest.mock('./mentorias/mentorias.service');
jest.mock('./users/users.service');

const authController = require('./auth/auth.controller');
const authService = require('./auth/auth.service');
const disciplinasController = require('./disciplinas/disciplinas.controller');
const disciplinasService = require('./disciplinas/disciplinas.service');
const leaderboardController = require('./leaderboard/leaderboard.controller');
const leaderboardService = require('./leaderboard/leaderboard.service');
const matchmakingController = require('./matchmaking/matchmaking.controller');
const matchmakingService = require('./matchmaking/matchmaking.service');
const mentoriasController = require('./mentorias/mentorias.controller');
const mentoriasService = require('./mentorias/mentorias.service');
const usersController = require('./users/users.controller');
const usersService = require('./users/users.service');

function criarRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const casos = [
  {
    nome: 'auth.cadastrar',
    executar: authController.cadastrar,
    servico: authService.cadastrar,
    req: { body: { nome: 'Ana', email: 'ana@exemplo.com', senha: '12345678' } },
  },
  {
    nome: 'auth.login',
    executar: authController.login,
    servico: authService.login,
    req: { body: { email: 'ana@exemplo.com', senha: '12345678' } },
  },
  {
    nome: 'disciplinas.listar',
    executar: disciplinasController.listar,
    servico: disciplinasService.listarDisciplinas,
    req: {},
  },
  {
    nome: 'leaderboard.obter',
    executar: leaderboardController.obter,
    servico: leaderboardService.obterLeaderboard,
    req: {},
  },
  {
    nome: 'matchmaking.buscar',
    executar: matchmakingController.buscar,
    servico: matchmakingService.buscarTutores,
    req: { query: { id_disciplina: '3' } },
  },
  {
    nome: 'mentorias.solicitar',
    executar: mentoriasController.solicitar,
    servico: mentoriasService.solicitarMentoria,
    req: { body: { id_tutor: 20, id_disciplina: 3, data_hora: '2030-01-01T10:00:00Z' } },
  },
  {
    nome: 'mentorias.responder',
    executar: mentoriasController.responder,
    servico: mentoriasService.responderSolicitacao,
    req: { params: { id: '1' }, body: { status: 'CONFIRMADA' } },
  },
  {
    nome: 'mentorias.definirLink',
    executar: mentoriasController.definirLink,
    servico: mentoriasService.definirLink,
    req: { params: { id: '1' }, body: { link_videochamada: 'https://meet.exemplo.com/abc' } },
  },
  {
    nome: 'mentorias.concluir',
    executar: mentoriasController.concluir,
    servico: mentoriasService.concluirMentoria,
    req: { params: { id: '1' } },
  },
  {
    nome: 'mentorias.listar',
    executar: mentoriasController.listar,
    servico: mentoriasService.listarMinhasMentorias,
    req: {},
  },
  {
    nome: 'mentorias.cancelar',
    executar: mentoriasController.cancelar,
    servico: mentoriasService.cancelarMentoria,
    req: { params: { id: '1' } },
  },
  {
    nome: 'users.atualizarPerfil',
    executar: usersController.atualizarPerfil,
    servico: usersService.atualizarPerfil,
    req: { body: { curso: 'Engenharia de Software', semestre: 3 } },
  },
  {
    nome: 'users.consultarXp',
    executar: usersController.consultarXp,
    servico: usersService.consultarXp,
    req: {},
  },
  {
    nome: 'users.obterPerfil',
    executar: usersController.obterPerfil,
    servico: usersService.obterPerfil,
    req: {},
  },
];

describe('Controllers - erro inesperado vira 500 e é registrado no log', () => {
  let erroNoConsole;

  beforeEach(() => {
    jest.clearAllMocks();
    erroNoConsole = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    erroNoConsole.mockRestore();
  });

  it.each(casos)('$nome', async ({ executar, servico, req }) => {
    const falha = new Error('banco fora do ar');
    servico.mockRejectedValue(falha);
    const res = criarRes();

    await executar(
      { usuario: { id_usuario: 10 }, body: {}, params: {}, query: {}, ...req },
      res
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(erroNoConsole).toHaveBeenCalledWith(falha);
  });
});