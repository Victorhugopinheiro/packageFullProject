/*
  Warnings:

  - Added the required column `totalAmount` to the `DeliveryRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerPackage` to the `Worker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeliveryRecord" ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "pricePerPackage" DOUBLE PRECISION NOT NULL;
