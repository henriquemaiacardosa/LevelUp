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

async function responder(req, res) {
  const id_mentoria = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isInteger(id_mentoria) || id_mentoria < 1) {
    return res.status(400).json({ erro: 'id da mentoria deve ser um número inteiro positivo.' });
  }
  if (!status) {
    return res.status(400).json({ erro: 'status é obrigatório.' });
  }

  try {
    const mentoria = await mentoriasService.responderSolicitacao({
      id_mentoria,
      id_usuario: req.usuario.id_usuario,
      status,
    });
    return res.status(200).json(mentoria);
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ erro: erro.message });
    }
    return res.status(500).json({ erro: 'Erro interno ao responder à solicitação.' });
  }
}

async function definirLink(req, res) {
  const id_mentoria = Number(req.params.id);
  const { link_videochamada } = req.body;

  if (!Number.isInteger(id_mentoria) || id_mentoria < 1) {
    return res.status(400).json({ erro: 'id da mentoria deve ser um número inteiro positivo.' });
  }
  if (!link_videochamada) {
    return res.status(400).json({ erro: 'link_videochamada é obrigatório.' });
  }

  try {
    const mentoria = await mentoriasService.definirLink({
      id_mentoria,
      id_usuario: req.usuario.id_usuario,
      link_videochamada,
    });
    return res.status(200).json(mentoria);
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ erro: erro.message });
    }
    return res.status(500).json({ erro: 'Erro interno ao definir o link.' });
  }
}

module.exports = { solicitar, responder, definirLink };