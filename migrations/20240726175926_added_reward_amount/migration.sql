/*
  Warnings:

  - Added the required column `amount` to the `Duty` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `duty` ADD COLUMN `amount` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `dutyreward` ADD COLUMN `isPaid` BOOLEAN NOT NULL DEFAULT false;
