/*
  Warnings:

  - You are about to drop the column `password` on the `center` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[adminUserId]` on the table `Center` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `center` DROP COLUMN `password`,
    ADD COLUMN `adminUserId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Center_adminUserId_key` ON `Center`(`adminUserId`);

-- AddForeignKey
ALTER TABLE `Center` ADD CONSTRAINT `Center_adminUserId_fkey` FOREIGN KEY (`adminUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
