jest.mock('./matchmaking.repository');

const matchmakingRepository = require('./matchmaking.repository');
const matchmakingService = require('./matchmaking.service');

describe('MatchmakingService - Buscar tutores', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar tutores da disciplina excluindo o próprio usuário (RN04)', async () => {
    const tutores = [
      { id_usuario: 20, nome: 'Marina', curso: 'Eng. Elétrica', semestre: 7 },
      { id_usuario: 21, nome: 'Lucas', curso: 'Engenharia de Software', semestre: 5 },
    ];
    matchmakingRepository.buscarTutoresPorDisciplina.mockResolvedValue(tutores);

    const resultado = await matchmakingService.buscarTutores(10, 5);

    expect(resultado).toEqual(tutores);
    expect(matchmakingRepository.buscarTutoresPorDisciplina).toHaveBeenCalledWith({
      id_disciplina: 5,
      id_usuario_logado: 10,
    });
  });

  it('deve retornar lista vazia quando não houver tutores para a disciplina', async () => {
    matchmakingRepository.buscarTutoresPorDisciplina.mockResolvedValue([]);

    const resultado = await matchmakingService.buscarTutores(10, 99);

    expect(resultado).toEqual([]);
  });
});