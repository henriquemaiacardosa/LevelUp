const usersRepository = require('./users.repository');

async function atualizarPerfil(id_usuario, dados) {
  return usersRepository.atualizarPerfil(id_usuario, dados);
}

module.exports = { atualizarPerfil };