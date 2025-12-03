-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "city" TEXT;
ALTER TABLE "Booking" ADD COLUMN "district" TEXT;
ALTER TABLE "Booking" ADD COLUMN "postcode" TEXT;
ALTER TABLE "Booking" ADD COLUMN "street" TEXT;

-- AlterTable
ALTER TABLE "JobPost" ADD COLUMN "city" TEXT;
ALTER TABLE "JobPost" ADD COLUMN "district" TEXT;
ALTER TABLE "JobPost" ADD COLUMN "postcode" TEXT;
ALTER TABLE "JobPost" ADD COLUMN "street" TEXT;

-- AlterTable
ALTER TABLE "ProviderProfile" ADD COLUMN "city" TEXT;
ALTER TABLE "ProviderProfile" ADD COLUMN "district" TEXT;
ALTER TABLE "ProviderProfile" ADD COLUMN "postcode" TEXT;
ALTER TABLE "ProviderProfile" ADD COLUMN "street" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "attachments" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "deletedBySender" BOOLEAN NOT NULL DEFAULT false,
    "deletedByReceiver" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("attachments", "content", "createdAt", "id", "messageType", "read", "receiverId", "senderId") SELECT "attachments", "content", "createdAt", "id", "messageType", "read", "receiverId", "senderId" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");
CREATE INDEX "Message_receiverId_idx" ON "Message"("receiverId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
