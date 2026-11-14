const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function gerarHash(senhaTextoPlano) {
  return bcrypt.hash(senhaTextoPlano, SALT_ROUNDS);
}

async function compararSenha(senhaTextoPlano, hashSalvo) {
  return bcrypt.compare(senhaTextoPlano, hashSalvo);
}

module.exports = { gerarHash, compararSenha };