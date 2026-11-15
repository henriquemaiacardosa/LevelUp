const disciplinasService = require('./disciplinas.service');

async function listar(req, res) {
  try {
    const disciplinas = await disciplinasService.listarDisciplinas();
    return res.status(200).json(disciplinas);
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

module.exports = { listar };