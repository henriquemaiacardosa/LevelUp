const { PrismaClient } = require('@prisma/client');

// Padrão Singleton: garante que toda a aplicação use a MESMA conexão
// com o banco, em vez de abrir uma conexão nova em cada arquivo que
// precisar consultar o MySQL.
const prisma = new PrismaClient();

module.exports = prisma;