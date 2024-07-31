-- AlterTable
ALTER TABLE `dayattendance` ADD COLUMN `attachment` VARCHAR(191) NULL,
    ADD COLUMN `isPaid` BOOLEAN NOT NULL DEFAULT false;
