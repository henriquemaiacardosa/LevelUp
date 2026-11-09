-- DropForeignKey
ALTER TABLE `disponibilidade` DROP FOREIGN KEY `Disponibilidade_id_usuario_fkey`;

-- AddForeignKey
ALTER TABLE `Disponibilidade` ADD CONSTRAINT `Disponibilidade_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
