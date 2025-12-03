-- CreateTable
CREATE TABLE "JobPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "category" TEXT NOT NULL,
    "budget" REAL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "customerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobPost_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobPostId" TEXT NOT NULL,
    "providerProfileId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNLOCKED',
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lead_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProviderProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "hourlyRate" REAL,
    "category" TEXT,
    "skills" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "location" TEXT,
    "profilePicture" TEXT,
    "providerType" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "businessName" TEXT,
    "businessRegNumber" TEXT,
    "businessAddress" TEXT,
    "taxNumber" TEXT,
    "numberOfEmployees" INTEGER,
    "yearsInBusiness" INTEGER,
    "businessDescription" TEXT,
    "businessLogo" TEXT,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE',
    "monthlyBookingCount" INTEGER NOT NULL DEFAULT 0,
    "bookingCountResetDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autoRevealContact" BOOLEAN NOT NULL DEFAULT true,
    "leadCredits" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProviderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProviderProfile" ("autoRevealContact", "bio", "bookingCountResetDate", "businessAddress", "businessDescription", "businessLogo", "businessName", "businessRegNumber", "category", "contactEmail", "contactPhone", "hourlyRate", "id", "location", "monthlyBookingCount", "numberOfEmployees", "profilePicture", "providerType", "skills", "subscriptionTier", "taxNumber", "userId", "yearsInBusiness") SELECT "autoRevealContact", "bio", "bookingCountResetDate", "businessAddress", "businessDescription", "businessLogo", "businessName", "businessRegNumber", "category", "contactEmail", "contactPhone", "hourlyRate", "id", "location", "monthlyBookingCount", "numberOfEmployees", "profilePicture", "providerType", "skills", "subscriptionTier", "taxNumber", "userId", "yearsInBusiness" FROM "ProviderProfile";
DROP TABLE "ProviderProfile";
ALTER TABLE "new_ProviderProfile" RENAME TO "ProviderProfile";
CREATE UNIQUE INDEX "ProviderProfile_userId_key" ON "ProviderProfile"("userId");
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "fee" REAL NOT NULL DEFAULT 0,
    "netAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bookingId" TEXT,
    "customerId" TEXT,
    "providerId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "description" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ProviderProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "bookingId", "createdAt", "customerId", "description", "fee", "id", "metadata", "netAmount", "providerId", "status", "stripeChargeId", "stripePaymentIntentId", "type", "updatedAt") SELECT "amount", "bookingId", "createdAt", "customerId", "description", "fee", "id", "metadata", "netAmount", "providerId", "status", "stripeChargeId", "stripePaymentIntentId", "type", "updatedAt" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_stripePaymentIntentId_key" ON "Transaction"("stripePaymentIntentId");
CREATE INDEX "Transaction_bookingId_idx" ON "Transaction"("bookingId");
CREATE INDEX "Transaction_customerId_idx" ON "Transaction"("customerId");
CREATE INDEX "Transaction_providerId_idx" ON "Transaction"("providerId");
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "JobPost_customerId_idx" ON "JobPost"("customerId");

-- CreateIndex
CREATE INDEX "JobPost_category_idx" ON "JobPost"("category");

-- CreateIndex
CREATE INDEX "JobPost_status_idx" ON "JobPost"("status");

-- CreateIndex
CREATE INDEX "Lead_providerProfileId_idx" ON "Lead"("providerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_jobPostId_providerProfileId_key" ON "Lead"("jobPostId", "providerProfileId");
