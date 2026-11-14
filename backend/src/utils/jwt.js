const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

const EXPIRACAO = '7d';

function gerarToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRACAO });
}

function verificarToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { gerarToken, verificarToken };