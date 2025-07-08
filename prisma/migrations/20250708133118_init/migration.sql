-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RSSFeed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RSSFeed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RSSFeed" ("category", "createdAt", "id", "isActive", "name", "updatedAt", "url", "userId") SELECT "category", "createdAt", "id", "isActive", "name", "updatedAt", "url", "userId" FROM "RSSFeed";
DROP TABLE "RSSFeed";
ALTER TABLE "new_RSSFeed" RENAME TO "RSSFeed";
CREATE UNIQUE INDEX "RSSFeed_url_key" ON "RSSFeed"("url");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
