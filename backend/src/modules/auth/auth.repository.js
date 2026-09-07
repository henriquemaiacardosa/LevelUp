const prisma = require('../../config/prisma');

async function buscarPorEmail(email) {
  return prisma.usuario.findUnique({ where: { email } });
}

async function criar({ nome, email, senha_hash }) {
  return prisma.usuario.create({
    data: { nome, email, senha_hash },
  });
}

module.exports = { buscarPorEmail, criar };