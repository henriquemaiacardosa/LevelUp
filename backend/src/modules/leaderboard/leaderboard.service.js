const leaderboardRepository = require('./leaderboard.repository');

const TAMANHO_TOP = 10;

async function obterLeaderboard(id_usuario_logado) {
  const usuarios = await leaderboardRepository.listarUsuariosComXp();

  const ranking = usuarios
    .map((u) => ({
      id_usuario: u.id_usuario,
      nome: u.nome,
      xp_total: u.xp_ensino + u.xp_aprendizado,
    }))
    .sort((a, b) => b.xp_total - a.xp_total || a.id_usuario - b.id_usuario)
    .map((u, indice) => ({ ...u, posicao: indice + 1 }));

  const top = ranking
    .slice(0, TAMANHO_TOP)
    .map(({ posicao, nome, xp_total }) => ({ posicao, nome, xp_total }));

  const proprio = ranking.find((u) => u.id_usuario === id_usuario_logado);

  return {
    top,
    minha_posicao: proprio
      ? { posicao: proprio.posicao, xp_total: proprio.xp_total }
      : null,
  };
}

module.exports = { obterLeaderboard };