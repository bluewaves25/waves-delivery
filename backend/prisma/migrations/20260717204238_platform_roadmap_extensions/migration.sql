/*
  Warnings:

  - The required column `trackingToken` was added to the `Parcel` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Areas" ADD COLUMN "latitude" REAL;
ALTER TABLE "Areas" ADD COLUMN "longitude" REAL;

-- AlterTable
ALTER TABLE "PickUpPoints" ADD COLUMN "latitude" REAL;
ALTER TABLE "PickUpPoints" ADD COLUMN "longitude" REAL;

-- AlterTable
ALTER TABLE "Shops" ADD COLUMN "latitude" REAL;
ALTER TABLE "Shops" ADD COLUMN "longitude" REAL;

-- CreateTable
CREATE TABLE "RiderLocation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fieldPackageHandlerId" INTEGER NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RiderLocation_fieldPackageHandlerId_fkey" FOREIGN KEY ("fieldPackageHandlerId") REFERENCES "FieldPackageHandler" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parcelId" INTEGER,
    "userId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "provider" TEXT NOT NULL DEFAULT 'paystack',
    "providerRef" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "purpose" TEXT NOT NULL DEFAULT 'parcel_charge',
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WalletLedger" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "paymentId" INTEGER,
    "entryType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "balanceAfter" REAL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WalletLedger_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parcelId" INTEGER NOT NULL,
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rating_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Rating_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Rating_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeviceToken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'android',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeviceToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ParcelTimeline" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parcelId" INTEGER NOT NULL,
    "parcelStatusId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "proofPhotoUrl" TEXT,
    "proofSignature" TEXT,
    "deliveryOtp" TEXT,
    "otpVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ParcelTimeline_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ParcelTimeline_parcelStatusId_fkey" FOREIGN KEY ("parcelStatusId") REFERENCES "ParcelStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ParcelTimeline" ("createdAt", "id", "message", "parcelId", "parcelStatusId", "updatedAt") SELECT "createdAt", "id", "message", "parcelId", "parcelStatusId", "updatedAt" FROM "ParcelTimeline";
DROP TABLE "ParcelTimeline";
ALTER TABLE "new_ParcelTimeline" RENAME TO "ParcelTimeline";
CREATE TABLE "new_FieldPackageHandler" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "address" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastLat" REAL,
    "lastLng" REAL,
    "lastLocationAt" DATETIME,
    "areaId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FieldPackageHandler_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Areas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FieldPackageHandler_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FieldPackageHandler" ("address", "areaId", "createdAt", "id", "updatedAt", "userId") SELECT "address", "areaId", "createdAt", "id", "updatedAt", "userId" FROM "FieldPackageHandler";
DROP TABLE "FieldPackageHandler";
ALTER TABLE "new_FieldPackageHandler" RENAME TO "FieldPackageHandler";
CREATE UNIQUE INDEX "FieldPackageHandler_userId_key" ON "FieldPackageHandler"("userId");
CREATE TABLE "new_Parcel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parcelNumber" TEXT NOT NULL,
    "trackingToken" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerAddress" TEXT NOT NULL,
    "customerLatitude" REAL,
    "customerLongitude" REAL,
    "customerParcelInvoiceId" TEXT,
    "parcelProductType" TEXT NOT NULL,
    "parcelProductCategoriesId" INTEGER NOT NULL,
    "parcelExtraInformation" TEXT,
    "parcelStatusId" INTEGER NOT NULL,
    "parcelWeight" INTEGER NOT NULL,
    "parcelCashCollection" REAL NOT NULL,
    "parcelPrice" REAL NOT NULL,
    "parcelCharge" REAL NOT NULL,
    "shopsId" INTEGER NOT NULL,
    "parcelPickUpId" INTEGER NOT NULL,
    "parcelDeliveryAreaId" INTEGER NOT NULL,
    "parcelUserId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fieldPackageHandlerId" INTEGER,
    "assignmentIdempotencyKey" TEXT,
    CONSTRAINT "Parcel_parcelProductCategoriesId_fkey" FOREIGN KEY ("parcelProductCategoriesId") REFERENCES "ParcelProductCategories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Parcel_parcelStatusId_fkey" FOREIGN KEY ("parcelStatusId") REFERENCES "ParcelStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Parcel_shopsId_fkey" FOREIGN KEY ("shopsId") REFERENCES "Shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Parcel_parcelPickUpId_fkey" FOREIGN KEY ("parcelPickUpId") REFERENCES "PickUpPoints" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Parcel_parcelDeliveryAreaId_fkey" FOREIGN KEY ("parcelDeliveryAreaId") REFERENCES "Areas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Parcel_parcelUserId_fkey" FOREIGN KEY ("parcelUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Parcel_fieldPackageHandlerId_fkey" FOREIGN KEY ("fieldPackageHandlerId") REFERENCES "FieldPackageHandler" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Parcel" ("createdAt", "customerAddress", "customerName", "customerParcelInvoiceId", "customerPhone", "fieldPackageHandlerId", "id", "parcelCashCollection", "parcelCharge", "parcelDeliveryAreaId", "parcelExtraInformation", "parcelNumber", "parcelPickUpId", "parcelPrice", "parcelProductCategoriesId", "parcelProductType", "parcelStatusId", "parcelUserId", "parcelWeight", "shopsId", "updatedAt") SELECT "createdAt", "customerAddress", "customerName", "customerParcelInvoiceId", "customerPhone", "fieldPackageHandlerId", "id", "parcelCashCollection", "parcelCharge", "parcelDeliveryAreaId", "parcelExtraInformation", "parcelNumber", "parcelPickUpId", "parcelPrice", "parcelProductCategoriesId", "parcelProductType", "parcelStatusId", "parcelUserId", "parcelWeight", "shopsId", "updatedAt" FROM "Parcel";
DROP TABLE "Parcel";
ALTER TABLE "new_Parcel" RENAME TO "Parcel";
CREATE UNIQUE INDEX "Parcel_parcelNumber_key" ON "Parcel"("parcelNumber");
CREATE UNIQUE INDEX "Parcel_trackingToken_key" ON "Parcel"("trackingToken");
CREATE UNIQUE INDEX "Parcel_assignmentIdempotencyKey_key" ON "Parcel"("assignmentIdempotencyKey");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_providerRef_key" ON "Payment"("providerRef");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceToken_token_key" ON "DeviceToken"("token");
