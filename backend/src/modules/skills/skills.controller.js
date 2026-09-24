const skillsService = require('./skills.service');

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
    return res.status(500).json({ erro: 'Erro ao cadastrar a demanda.' });
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
    return res.status(500).json({ erro: 'Erro ao cadastrar a oferta.' });
  }
}

module.exports = { cadastrarDemanda, cadastrarOferta };