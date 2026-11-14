-- CreateTable
CREATE TABLE `Usuario` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha_hash` VARCHAR(191) NOT NULL,
    `curso` VARCHAR(191) NULL,
    `semestre` INTEGER NULL,
    `xp_ensino` INTEGER NOT NULL DEFAULT 0,
    `xp_aprendizado` INTEGER NOT NULL DEFAULT 0,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Disciplina` (
    `id_disciplina` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_disciplina` VARCHAR(191) NOT NULL,
    `area_conhecimento` VARCHAR(191) NULL,

    PRIMARY KEY (`id_disciplina`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventario_Habilidades` (
    `id_habilidade` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_disciplina` INTEGER NOT NULL,
    `tipo_habilidade` ENUM('OFERTA', 'DEMANDA') NOT NULL,

    UNIQUE INDEX `Inventario_Habilidades_id_usuario_id_disciplina_tipo_habilid_key`(`id_usuario`, `id_disciplina`, `tipo_habilidade`),
    PRIMARY KEY (`id_habilidade`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mentoria` (
    `id_mentoria` INTEGER NOT NULL AUTO_INCREMENT,
    `id_aluno` INTEGER NOT NULL,
    `id_tutor` INTEGER NOT NULL,
    `id_disciplina` INTEGER NOT NULL,
    `data_hora` DATETIME(3) NOT NULL,
    `status` ENUM('PENDENTE', 'CONFIRMADA', 'CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    `link_videochamada` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_mentoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Inventario_Habilidades` ADD CONSTRAINT `Inventario_Habilidades_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventario_Habilidades` ADD CONSTRAINT `Inventario_Habilidades_id_disciplina_fkey` FOREIGN KEY (`id_disciplina`) REFERENCES `Disciplina`(`id_disciplina`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mentoria` ADD CONSTRAINT `Mentoria_id_aluno_fkey` FOREIGN KEY (`id_aluno`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mentoria` ADD CONSTRAINT `Mentoria_id_tutor_fkey` FOREIGN KEY (`id_tutor`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mentoria` ADD CONSTRAINT `Mentoria_id_disciplina_fkey` FOREIGN KEY (`id_disciplina`) REFERENCES `Disciplina`(`id_disciplina`) ON DELETE RESTRICT ON UPDATE CASCADE;
