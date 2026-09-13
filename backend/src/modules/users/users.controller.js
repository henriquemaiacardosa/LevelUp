const usersService = require('./users.service');

async function atualizarPerfil(req, res) {
  const { id_usuario } = req.usuario;
  const { curso, semestre } = req.body;

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

module.exports = { atualizarPerfil };