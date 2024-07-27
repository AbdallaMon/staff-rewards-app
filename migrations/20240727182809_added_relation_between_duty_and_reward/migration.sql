/*
  Warnings:

  - Added the required column `attendanceId` to the `DutyReward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `DutyReward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dutyreward` ADD COLUMN `attendanceId` INTEGER NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `DutyReward` ADD CONSTRAINT `DutyReward_attendanceId_fkey` FOREIGN KEY (`attendanceId`) REFERENCES `Attendance`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DutyReward` ADD CONSTRAINT `DutyReward_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
