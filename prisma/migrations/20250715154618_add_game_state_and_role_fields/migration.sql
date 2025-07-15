-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "isReady" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roleData" JSONB;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "phase" TEXT NOT NULL DEFAULT 'lobby',
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Room_phase_idx" ON "Room"("phase");
