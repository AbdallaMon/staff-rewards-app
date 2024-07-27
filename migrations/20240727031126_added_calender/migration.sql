/*
  Warnings:

  - You are about to drop the column `examTypeId` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the `examtype` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[emiratesId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ibanBank]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passportNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `Attendance_examTypeId_fkey`;

-- AlterTable
ALTER TABLE `attendance` DROP COLUMN `examTypeId`,
    MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `centershift` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `duty` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `dutyreward` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `shift` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `shiftschedule` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user` ADD COLUMN `bankUserName` VARCHAR(191) NULL,
    ADD COLUMN `emiratesIdPhoto` VARCHAR(191) NULL,
    ADD COLUMN `examType` ENUM('TEACHER', 'GRADUATE') NULL,
    ADD COLUMN `graduationImage` VARCHAR(191) NULL,
    ADD COLUMN `graduationName` VARCHAR(191) NULL,
    ADD COLUMN `ibanBankPhoto` VARCHAR(191) NULL,
    ADD COLUMN `passportNumber` VARCHAR(191) NULL,
    ADD COLUMN `passportPhoto` VARCHAR(191) NULL,
    ADD COLUMN `photo` VARCHAR(191) NULL,
    MODIFY `rating` DOUBLE NULL DEFAULT 0;

-- DropTable
DROP TABLE `examtype`;

-- CreateTable
CREATE TABLE `Calendar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `examType` ENUM('TEACHER', 'GRADUATE') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_emiratesId_key` ON `User`(`emiratesId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_ibanBank_key` ON `User`(`ibanBank`);

-- CreateIndex
CREATE UNIQUE INDEX `User_passportNumber_key` ON `User`(`passportNumber`);
