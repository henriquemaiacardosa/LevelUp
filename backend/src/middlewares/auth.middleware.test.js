const authMiddleware = require('./auth.middleware');
const { gerarToken } = require('../utils/jwt');

describe('Middleware de Autenticação (RNF03 / RN01)', () => {
  it('deve chamar next() e anexar os dados do usuário em req.usuario quando o token for válido', () => {
    const token = gerarToken({ id_usuario: 10 });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.usuario.id_usuario).toBe(10);
  });

  it('deve retornar 401 se nenhum header Authorization for enviado', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 se o token for inválido ou estiver corrompido', () => {
    const req = { headers: { authorization: 'Bearer token-falso-invalido' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});