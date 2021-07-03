/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "subscribeType" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "Viewed" (
    "id" SERIAL NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT,
    "userId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Film" (
    "id" SERIAL NOT NULL,
    "img" TEXT,
    "title" TEXT,
    "description" TEXT,
    "categories" INTEGER,
    "itemTitle" TEXT,
    "ratingKinopoisk" TEXT,
    "ratingIMDb" TEXT,
    "trailer" TEXT,
    "more" TEXT,
    "releaseYear" INTEGER,
    "country" TEXT,
    "directors" TEXT,
    "geners" TEXT,
    "cast" TEXT,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Viewed" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
