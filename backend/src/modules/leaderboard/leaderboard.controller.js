const leaderboardService = require('./leaderboard.service');

async function obter(req, res) {
  try {
    const resultado = await leaderboardService.obterLeaderboard(
      req.usuario.id_usuario
    );
    return res.status(200).json(resultado);
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ erro: erro.message });
    }
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

module.exports = { obter };