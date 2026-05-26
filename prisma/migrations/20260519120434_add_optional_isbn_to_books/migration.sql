/*
  Warnings:

  - A unique constraint covering the columns `[isbn]` on the table `books` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "books" ADD COLUMN     "isbn" VARCHAR(25);

-- CreateIndex
CREATE UNIQUE INDEX "books_isbn_key" ON "books"("isbn");
