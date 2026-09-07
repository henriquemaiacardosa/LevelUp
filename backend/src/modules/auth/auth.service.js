const authRepository = require('./auth.repository');
const { gerarHash } = require('../../utils/hash');

async function cadastrar({ nome, email, senha }) {
  const usuarioExistente = await authRepository.buscarPorEmail(email);

  if (usuarioExistente) {
    throw new Error('E-mail já cadastrado');
  }

  const senha_hash = await gerarHash(senha);

  const novoUsuario = await authRepository.criar({ nome, email, senha_hash });

  return novoUsuario;
}

module.exports = { cadastrar };