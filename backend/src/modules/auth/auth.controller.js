const authService = require('./auth.service');

function emailValido(email) {
  if (email.length > 254 || /\s/.test(email)) return false;

  const partes = email.split('@');
  if (partes.length !== 2) return false;

  const [local, dominio] = partes;
  return (
    local.length > 0 &&
    dominio.includes('.') &&
    !dominio.startsWith('.') &&
    !dominio.endsWith('.')
  );
}

async function cadastrar(req, res) {
  const { nome, email, senha } = req.body ?? {};

  const camposTexto = [nome, email, senha].every((valor) => typeof valor === 'string');
  if (!camposTexto || !nome.trim() || !email.trim() || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  }

  const emailNormalizado = email.trim().toLowerCase();
  if (!emailValido(emailNormalizado)) {
    return res.status(400).json({ erro: 'E-mail inválido.' });
  }

  if (senha.length < 8) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 8 caracteres.' });
  }

  try {
    const novoUsuario = await authService.cadastrar({
      nome: nome.trim(),
      email: emailNormalizado,
      senha,
    });

    const { senha_hash, ...usuarioSemSenha } = novoUsuario;

    return res.status(201).json(usuarioSemSenha);
  } catch (erro) {
    if (erro.message === 'E-mail já cadastrado') {
      return res.status(409).json({ erro: erro.message });
    }

    return res.status(500).json({ erro: 'Erro interno ao processar o cadastro.' });
  }
}

async function login(req, res) {
  const { email, senha } = req.body ?? {};

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const resultado = await authService.login({ email, senha });

    return res.status(200).json(resultado);
  } catch (erro) {
    if (erro.message === 'Credenciais inválidas') {
      return res.status(401).json({ erro: erro.message });
    }

    return res.status(500).json({ erro: 'Erro interno ao processar o login.' });
  }
}

module.exports = { cadastrar, login };