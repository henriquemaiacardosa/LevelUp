const matchmakingService = require('./matchmaking.service');

async function buscar(req, res) {
  const id_disciplina = Number(req.query.id_disciplina);

  if (!Number.isInteger(id_disciplina) || id_disciplina < 1) {
    return res.status(400).json({ erro: 'id_disciplina deve ser um número inteiro positivo.' });
  }

  try {
    const tutores = await matchmakingService.buscarTutores(req.usuario.id_usuario, id_disciplina);
    return res.status(200).json(tutores);
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro interno ao buscar tutores.' });
  }
}

module.exports = { buscar };