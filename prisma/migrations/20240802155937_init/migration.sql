-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    "author" TEXT,
    "generator" TEXT
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    "author" TEXT,
    "generator" TEXT
);

-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keyword" TEXT NOT NULL,
    "limit" INTEGER NOT NULL DEFAULT 10,
    "skip" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apiUrl" TEXT NOT NULL,
    "domainUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'non_active'
);
