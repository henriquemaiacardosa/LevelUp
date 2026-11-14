-- CreateTable
CREATE TABLE `Disponibilidade` (
    `id_disponibilidade` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `dia_semana` ENUM('SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO') NOT NULL,
    `turno` ENUM('MANHA', 'TARDE', 'NOITE') NOT NULL,

    UNIQUE INDEX `Disponibilidade_id_usuario_dia_semana_turno_key`(`id_usuario`, `dia_semana`, `turno`),
    PRIMARY KEY (`id_disponibilidade`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Disponibilidade` ADD CONSTRAINT `Disponibilidade_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;
