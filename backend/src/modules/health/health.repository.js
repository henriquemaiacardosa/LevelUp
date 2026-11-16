const prisma = require('../../config/prisma');

async function consultarBanco() {
  await prisma.$queryRaw`SELECT 1`;
  return true;
}

module.exports = { consultarBanco };