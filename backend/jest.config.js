module.exports = {
  testEnvironment: 'node', 
  coveragePathIgnorePatterns: ['/node_modules/', '/prisma/'],
  setupFiles: ['<rootDir>/jest.setup.js'],
};