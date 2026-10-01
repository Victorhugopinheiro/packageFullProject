-- Sync DB structure with current Prisma schema using a non-destructive path.
-- Keep legacy Worker table/data for now; app reads/writes WorkerProfile.

CREATE TABLE IF NOT EXISTS "WorkerProfile" (
    "userId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "phone" TEXT,
    "pricePerPackage" DOUBLE PRECISION NOT NULL,
    "image" TEXT,
    "address" TEXT,

    CONSTRAINT "WorkerProfile_pkey" PRIMARY KEY ("userId"),
    CONSTRAINT "WorkerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkerProfile_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "WorkerProfile_adminId_idx" ON "WorkerProfile"("adminId");

-- Best-effort backfill for rows where a legacy Worker id already matches a User id.
INSERT INTO "WorkerProfile" ("userId", "adminId", "phone", "pricePerPackage", "image")
SELECT w."id", w."adminId", w."phone", w."pricePerPackage", w."image"
FROM "Worker" w
INNER JOIN "User" u ON u."id" = w."id"
ON CONFLICT ("userId") DO NOTHING;

-- Ensure newly created users default to ADMIN as defined in the current Prisma schema.
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'ADMIN';

-- Align DeliveryRecord relation with current schema.
ALTER TABLE "DeliveryRecord" DROP CONSTRAINT IF EXISTS "DeliveryRecord_workerId_fkey";
ALTER TABLE "DeliveryRecord"
    ADD CONSTRAINT "DeliveryRecord_workerId_fkey"
    FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;
