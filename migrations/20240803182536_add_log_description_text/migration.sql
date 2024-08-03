/*
  Warnings:

  - Made the column `description` on table `log` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `log` MODIFY `description` TEXT NOT NULL;
