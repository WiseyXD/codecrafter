/*
  Warnings:

  - You are about to drop the column `type` on the `alerts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "alerts" DROP COLUMN "type",
ADD COLUMN     "types" "AlertType"[];
