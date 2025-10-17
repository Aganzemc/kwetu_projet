-- CreateTable
CREATE TABLE "GroupJoinRequest" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupJoinRequest_groupId_userId_key" ON "GroupJoinRequest"("groupId", "userId");

-- AddForeignKey
ALTER TABLE "GroupJoinRequest" ADD CONSTRAINT "GroupJoinRequest_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupJoinRequest" ADD CONSTRAINT "GroupJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
