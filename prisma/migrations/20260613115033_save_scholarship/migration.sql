-- CreateTable
CREATE TABLE "scholarship_user" (
    "user_id" TEXT NOT NULL,
    "scholarship_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scholarship_user_pkey" PRIMARY KEY ("user_id","scholarship_id")
);

-- CreateIndex
CREATE INDEX "scholarship_user_scholarship_id_idx" ON "scholarship_user"("scholarship_id");

-- AddForeignKey
ALTER TABLE "scholarship_user" ADD CONSTRAINT "scholarship_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_user" ADD CONSTRAINT "scholarship_user_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarship_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
