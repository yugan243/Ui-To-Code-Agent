/*
  Warnings:

  - You are about to drop the column `geminiFileUri` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `geminiUploadTime` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `geminiFileUri` on the `UIFile` table. All the data in the column will be lost.
  - You are about to drop the column `geminiUploadTime` on the `UIFile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "geminiFileUri",
DROP COLUMN "geminiUploadTime";

-- AlterTable
ALTER TABLE "UIFile" DROP COLUMN "geminiFileUri",
DROP COLUMN "geminiUploadTime";
