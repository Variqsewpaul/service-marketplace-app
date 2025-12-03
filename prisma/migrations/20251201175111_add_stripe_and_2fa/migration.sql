-- CreateTable
CREATE TABLE "TwoFactorToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    "street" TEXT,
    "district" TEXT,
    "city" TEXT,
    "postcode" TEXT,
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
    "stripeAccountId" TEXT,
    "stripeOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ProviderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProviderProfile" ("autoRevealContact", "bio", "bookingCountResetDate", "businessAddress", "businessDescription", "businessLogo", "businessName", "businessRegNumber", "category", "city", "contactEmail", "contactPhone", "district", "hourlyRate", "id", "leadCredits", "location", "monthlyBookingCount", "numberOfEmployees", "postcode", "profilePicture", "providerType", "skills", "street", "subscriptionTier", "taxNumber", "userId", "yearsInBusiness") SELECT "autoRevealContact", "bio", "bookingCountResetDate", "businessAddress", "businessDescription", "businessLogo", "businessName", "businessRegNumber", "category", "city", "contactEmail", "contactPhone", "district", "hourlyRate", "id", "leadCredits", "location", "monthlyBookingCount", "numberOfEmployees", "postcode", "profilePicture", "providerType", "skills", "street", "subscriptionTier", "taxNumber", "userId", "yearsInBusiness" FROM "ProviderProfile";
DROP TABLE "ProviderProfile";
ALTER TABLE "new_ProviderProfile" RENAME TO "ProviderProfile";
CREATE UNIQUE INDEX "ProviderProfile_userId_key" ON "ProviderProfile"("userId");
CREATE UNIQUE INDEX "ProviderProfile_stripeAccountId_key" ON "ProviderProfile"("stripeAccountId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "stripeCustomerId" TEXT,
    "defaultPaymentMethodId" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT true,
    "twoFactorMethod" TEXT NOT NULL DEFAULT 'EMAIL',
    "twoFactorSecret" TEXT,
    "phoneNumber" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "backupCodes" TEXT
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactorToken_token_key" ON "TwoFactorToken"("token");

-- CreateIndex
CREATE INDEX "TwoFactorToken_userId_idx" ON "TwoFactorToken"("userId");

-- CreateIndex
CREATE INDEX "TwoFactorToken_token_idx" ON "TwoFactorToken"("token");
