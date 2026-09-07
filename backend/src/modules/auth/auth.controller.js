const authService = require('./auth.service');

async function cadastrar(req, res) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  }

  try {
    const novoUsuario = await authService.cadastrar({ nome, email, senha });

    const { senha_hash, ...usuarioSemSenha } = novoUsuario;

    return res.status(201).json(usuarioSemSenha);
  } catch (erro) {
    if (erro.message === 'E-mail já cadastrado') {
      return res.status(409).json({ erro: erro.message });
    }
    return res.status(500).json({ erro: 'Erro interno ao processar o cadastro.' });
  }
}

module.exports = { cadastrar };