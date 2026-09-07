const { verificarToken } = require('../utils/jwt');

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
  }

  // O header vem no formato "Bearer <token>" — extraímos só o token.
  const [, token] = authHeader.split(' ');

  try {
    const payload = verificarToken(token);

    req.usuario = payload;

    return next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

module.exports = autenticar;