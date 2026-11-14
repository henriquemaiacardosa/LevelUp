const authRepository = require('./auth.repository');
const { gerarHash, compararSenha } = require('../../utils/hash');
const { gerarToken } = require('../../utils/jwt');

async function cadastrar({ nome, email, senha }) {
  const usuarioExistente = await authRepository.buscarPorEmail(email);

  if (usuarioExistente) {
    throw new Error('E-mail já cadastrado');
  }

  const senha_hash = await gerarHash(senha);

  const novoUsuario = await authRepository.criar({ nome, email, senha_hash });

  return novoUsuario;
}

async function login({ email, senha }) {
  const usuario = await authRepository.buscarPorEmail(email);

  if (!usuario) {
    throw new Error('Credenciais inválidas');
  }

  const senhaConfere = await compararSenha(senha, usuario.senha_hash);

  if (!senhaConfere) {
    throw new Error('Credenciais inválidas');
  }

  const token = gerarToken({ id_usuario: usuario.id_usuario });

  return { token, usuario: { id_usuario: usuario.id_usuario, nome: usuario.nome, email: usuario.email } };
}

module.exports = { cadastrar, login };