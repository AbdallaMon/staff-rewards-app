/*
  Warnings:

  - You are about to drop the column `attendanceId` on the `log` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `log` DROP FOREIGN KEY `Log_attendanceId_fkey`;

-- AlterTable
ALTER TABLE `log` DROP COLUMN `attendanceId`,
    ADD COLUMN `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `bankApprovalAttachment` VARCHAR(191) NULL;
