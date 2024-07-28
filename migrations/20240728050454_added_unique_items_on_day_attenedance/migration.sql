/*
  Warnings:

  - A unique constraint covering the columns `[userId,date,centerId]` on the table `DayAttendance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `DayAttendance_userId_date_centerId_key` ON `DayAttendance`(`userId`, `date`, `centerId`);
