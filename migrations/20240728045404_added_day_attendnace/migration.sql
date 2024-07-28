-- AlterTable
ALTER TABLE `attendance` ADD COLUMN `dayAttendanceId` INTEGER NULL;

-- CreateTable
CREATE TABLE `DayAttendance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `centerId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `examType` VARCHAR(191) NULL,
    `totalReward` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DayAttendance` ADD CONSTRAINT `DayAttendance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DayAttendance` ADD CONSTRAINT `DayAttendance_centerId_fkey` FOREIGN KEY (`centerId`) REFERENCES `Center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_dayAttendanceId_fkey` FOREIGN KEY (`dayAttendanceId`) REFERENCES `DayAttendance`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
