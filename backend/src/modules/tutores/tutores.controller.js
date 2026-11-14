const tutoresService = require('./tutores.service');

async function detalhar(req, res) {
  try {
    const tutor = await tutoresService.obterDetalhesTutor(
      req.usuario.id_usuario,
      req.params.id_usuario
    );
    return res.status(200).json(tutor);
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

module.exports = { detalhar };