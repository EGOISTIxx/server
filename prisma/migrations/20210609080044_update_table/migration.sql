/*
  Warnings:

  - The `country` column on the `Film` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `directors` column on the `Film` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `geners` column on the `Film` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `cast` column on the `Film` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `kino` column on the `Film` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Film" DROP COLUMN "country",
ADD COLUMN     "country" JSONB,
DROP COLUMN "directors",
ADD COLUMN     "directors" JSONB,
DROP COLUMN "geners",
ADD COLUMN     "geners" JSONB,
DROP COLUMN "cast",
ADD COLUMN     "cast" JSONB,
DROP COLUMN "kino",
ADD COLUMN     "kino" JSONB;
