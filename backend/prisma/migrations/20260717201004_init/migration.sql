-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Roles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "roleDescriptionId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Roles_roleDescriptionId_fkey" FOREIGN KEY ("roleDescriptionId") REFERENCES "RoleDescription" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoleDescription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "FieldPackageHandler" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "address" TEXT NOT NULL,
    "areaId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FieldPackageHandler_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Areas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FieldPackageHandler_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Shops" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "productSubType" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Shops_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PickUpPoints" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "areaId" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "shopsId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PickUpPoints_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Areas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PickUpPoints_shopsId_fkey" FOREIGN KEY ("shopsId") REFERENCES "Shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShopProductsParentCategories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "ShopProductsChildCategories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" INTEGER NOT NULL,
    CONSTRAINT "ShopProductsChildCategories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ShopProductsParentCategories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Divisions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Districts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "divisionId" INTEGER NOT NULL,
    CONSTRAINT "Districts_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Divisions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Areas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "districtId" INTEGER NOT NULL,
    "zonesId" INTEGER NOT NULL,
    CONSTRAINT "Areas_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "Districts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Areas_zonesId_fkey" FOREIGN KEY ("zonesId") REFERENCES "Zones" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Zones" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "parcelPricingId" INTEGER NOT NULL,
    CONSTRAINT "Zones_parcelPricingId_fkey" FOREIGN KEY ("parcelPricingId") REFERENCES "ParcelPricing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParcelPricing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "KG05_PRICE" REAL NOT NULL,
    "KG1_PRICE" REAL NOT NULL,
    "KG2_PRICE" REAL NOT NULL,
    "KG3_PRICE" REAL NOT NULL,
    "KG4_PRICE" REAL NOT NULL,
    "KG5_PRICE" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "ParcelProductCategories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Parcel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parcelNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerAddress" TEXT NOT NULL,
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
    CONSTRAINT "Parcel_parcelProductCategoriesId_fkey" FOREIGN KEY ("parcelProductCategoriesId") REFERENCES "ParcelProductCategories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Parcel_parcelStatusId_fkey" FOREIGN KEY ("parcelStatusId") REFERENCES "ParcelStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Parcel_shopsId_fkey" FOREIGN KEY ("shopsId") REFERENCES "Shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Parcel_parcelPickUpId_fkey" FOREIGN KEY ("parcelPickUpId") REFERENCES "PickUpPoints" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Parcel_parcelDeliveryAreaId_fkey" FOREIGN KEY ("parcelDeliveryAreaId") REFERENCES "Areas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Parcel_parcelUserId_fkey" FOREIGN KEY ("parcelUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Parcel_fieldPackageHandlerId_fkey" FOREIGN KEY ("fieldPackageHandlerId") REFERENCES "FieldPackageHandler" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParcelStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "ParcelTimeline" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parcelId" INTEGER NOT NULL,
    "parcelStatusId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ParcelTimeline_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ParcelTimeline_parcelStatusId_fkey" FOREIGN KEY ("parcelStatusId") REFERENCES "ParcelStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RoleDescription_name_key" ON "RoleDescription"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FieldPackageHandler_userId_key" ON "FieldPackageHandler"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopProductsParentCategories_name_key" ON "ShopProductsParentCategories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ShopProductsChildCategories_name_key" ON "ShopProductsChildCategories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Divisions_name_key" ON "Divisions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Districts_name_key" ON "Districts"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Areas_name_key" ON "Areas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Zones_name_key" ON "Zones"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ParcelProductCategories_name_key" ON "ParcelProductCategories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Parcel_parcelNumber_key" ON "Parcel"("parcelNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ParcelStatus_name_key" ON "ParcelStatus"("name");
