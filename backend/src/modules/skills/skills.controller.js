const skillsService = require('./skills.service');

function responderErro(res, erro, mensagemPadrao) {
  if (erro.status) {
    return res.status(erro.status).json({ erro: erro.message });
  }

  console.error(erro);
  return res.status(500).json({ erro: mensagemPadrao });
}

async function cadastrarDemanda(req, res) {
  const { id_usuario } = req.usuario;
  const { id_disciplina } = req.body;

  if (!id_disciplina) {
    return res.status(400).json({ erro: 'id_disciplina é obrigatório.' });
  }

  try {
    const habilidade = await skillsService.cadastrarDemanda(id_usuario, id_disciplina);
    return res.status(201).json(habilidade);
  } catch (erro) {
      return responderErro(res, erro, 'Erro ao cadastrar a demanda.');
  }
}

async function cadastrarOferta(req, res) {
  const { id_usuario } = req.usuario;
  const { id_disciplina } = req.body;

  if (!id_disciplina) {
    return res.status(400).json({ erro: 'id_disciplina é obrigatório.' });
  }

  try {
    const habilidade = await skillsService.cadastrarOferta(id_usuario, id_disciplina);
    return res.status(201).json(habilidade);
  } catch (erro) {
      return responderErro(res, erro, 'Erro ao cadastrar a oferta.');
  }
}

async function listar(req, res) {
  try {
    const resultado = await skillsService.listarMinhasHabilidades(req.usuario.id_usuario);
    return res.status(200).json(resultado);
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ erro: erro.message });
    }
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

async function remover(req, res) {
  try {
    await skillsService.removerHabilidade(req.usuario.id_usuario, req.params.id_habilidade);
    return res.status(204).end();
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

module.exports = { cadastrarDemanda, cadastrarOferta, listar, remover, responderErro };