/*
  Warnings:

  - A unique constraint covering the columns `[nome_disciplina]` on the table `Disciplina` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Disciplina_nome_disciplina_key` ON `Disciplina`(`nome_disciplina`);
