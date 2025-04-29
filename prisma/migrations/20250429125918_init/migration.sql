/*
  Warnings:

  - You are about to drop the column `name` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Video` table. All the data in the column will be lost.
  - Added the required column `filename` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalPath` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "name",
DROP COLUMN "path",
DROP COLUMN "updatedAt",
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "finalPath" TEXT,
ADD COLUMN     "originalPath" TEXT NOT NULL,
ADD COLUMN     "subtitlePath" TEXT,
ADD COLUMN     "trimmedPath" TEXT,
ALTER COLUMN "duration" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "status" DROP DEFAULT;
