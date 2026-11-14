const usersRepository = require('./users.repository');

async function atualizarPerfil(id_usuario, dados) {
  return usersRepository.atualizarPerfil(id_usuario, dados);
}

const XP_POR_NIVEL = 100;

async function consultarXp(id_usuario) {
  const xp = await usersRepository.buscarXpPorId(id_usuario);

  if (!xp) {
    const erro = new Error('Usuário não encontrado.');
    erro.status = 404;
    throw erro;
  }

  const xp_total = xp.xp_ensino + xp.xp_aprendizado;

  return {
    xp_ensino: xp.xp_ensino,
    xp_aprendizado: xp.xp_aprendizado,
    xp_total,
    nivel: Math.floor(xp_total / XP_POR_NIVEL) + 1,
  };
}

async function obterPerfil(id_usuario) {
  const usuario = await usersRepository.buscarPerfilPorId(id_usuario);

  if (!usuario) {
    const erro = new Error('Usuário não encontrado.');
    erro.status = 404;
    throw erro;
  }

  return {
    id_usuario: usuario.id_usuario,
    nome: usuario.nome,
    email: usuario.email,
    curso: usuario.curso,
    semestre: usuario.semestre,
  };
}

module.exports = { atualizarPerfil, consultarXp, obterPerfil };