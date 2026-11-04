const disponibilidadeService = require('./disponibilidade.service');

function responderErro(res, erro) {
  if (erro.status) {
    return res.status(erro.status).json({ erro: erro.message });
  }
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
}

async function listar(req, res) {
  try {
    const resultado = await disponibilidadeService.listarMinhaDisponibilidade(
      req.usuario.id_usuario
    );
    return res.status(200).json(resultado);
  } catch (erro) {
    return responderErro(res, erro);
  }
}

async function salvar(req, res) {
  try {
    const resultado = await disponibilidadeService.salvarMinhaDisponibilidade(
      req.usuario.id_usuario,
      req.body.disponibilidade
    );
    return res.status(200).json(resultado);
  } catch (erro) {
    return responderErro(res, erro);
  }
}

module.exports = { listar, salvar };