/*
  Warnings:

  - You are about to drop the `rating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `rating` DROP FOREIGN KEY `Rating_centerId_fkey`;

-- DropForeignKey
ALTER TABLE `rating` DROP FOREIGN KEY `Rating_userId_fkey`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `rating` DOUBLE NULL;

-- DropTable
DROP TABLE `rating`;
