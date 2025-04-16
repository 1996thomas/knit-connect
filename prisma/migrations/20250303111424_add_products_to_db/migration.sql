/*
  Warnings:

  - Made the column `shop` on table `Partner` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" INTEGER NOT NULL,
    CONSTRAINT "Product_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Partner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "accessToken" TEXT
);
INSERT INTO "new_Partner" ("accessToken", "id", "shop") SELECT "accessToken", "id", "shop" FROM "Partner";
DROP TABLE "Partner";
ALTER TABLE "new_Partner" RENAME TO "Partner";
CREATE UNIQUE INDEX "Partner_shop_key" ON "Partner"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
