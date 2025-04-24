/*
  Warnings:

  - A unique constraint covering the columns `[shop]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Admin_shop_key" ON "Admin"("shop");
