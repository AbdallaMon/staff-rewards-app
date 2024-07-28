/*
  Warnings:

  - You are about to drop the `centershift` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shiftschedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `centershift` DROP FOREIGN KEY `CenterShift_centerId_fkey`;

-- DropForeignKey
ALTER TABLE `centershift` DROP FOREIGN KEY `CenterShift_shiftId_fkey`;

-- DropForeignKey
ALTER TABLE `shiftschedule` DROP FOREIGN KEY `ShiftSchedule_centerShiftId_fkey`;

-- DropTable
DROP TABLE `centershift`;

-- DropTable
DROP TABLE `shiftschedule`;

-- CreateTable
CREATE TABLE `Log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `attendanceId` INTEGER NOT NULL,
    `action` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_attendanceId_fkey` FOREIGN KEY (`attendanceId`) REFERENCES `Attendance`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
