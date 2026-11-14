const usersService = require('./users.service');

async function atualizarPerfil(req, res) {
  const { id_usuario } = req.usuario;
  const { curso, semestre } = req.body;

  if (semestre !== undefined && (typeof semestre !== 'number' || !Number.isInteger(semestre) || semestre < 1)) {
    return res.status(400).json({ erro: 'Semestre deve ser um número inteiro positivo.' });
  }

  try {
    const usuarioAtualizado = await usersService.atualizarPerfil(id_usuario, {
      curso,
      semestre,
    });

    return res.status(200).json(usuarioAtualizado);
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro ao atualizar o perfil.' });
  }
}

async function consultarXp(req, res) {
  try {
    const xp = await usersService.consultarXp(req.usuario.id_usuario);
    return res.status(200).json(xp);
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ erro: erro.message });
    }
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

async function obterPerfil(req, res) {
  try {
    const perfil = await usersService.obterPerfil(req.usuario.id_usuario);
    return res.status(200).json(perfil);
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ erro: erro.message });
    }
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

module.exports = { atualizarPerfil, consultarXp, obterPerfil };