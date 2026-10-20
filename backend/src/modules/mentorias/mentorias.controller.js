const mentoriasService = require('./mentorias.service');

async function solicitar(req, res) {
  const { id_tutor, id_disciplina, data_hora } = req.body;

  if (!Number.isInteger(id_tutor) || !Number.isInteger(id_disciplina) || !data_hora) {
    return res
      .status(400)
      .json({ erro: 'id_tutor, id_disciplina (inteiros) e data_hora são obrigatórios.' });
  }

  try {
    const mentoria = await mentoriasService.solicitarMentoria({
      id_aluno: req.usuario.id_usuario,
      id_tutor,
      id_disciplina,
      data_hora,
    });
    return res.status(201).json(mentoria);
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ erro: erro.message });
    }
    return res.status(500).json({ erro: 'Erro interno ao solicitar mentoria.' });
  }
}

module.exports = { solicitar };