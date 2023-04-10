-- CreateTable
CREATE TABLE "Message" (
"id" SERIAL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inWindow" BOOLEAN NOT NULL,
    "message" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Randomization" (
"id" SERIAL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageTime" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ema" (
"id" SERIAL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "set" TEXT NOT NULL,
    "responses" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "complete" BOOLEAN NOT NULL DEFAULT false,
    "prompt" TEXT NOT NULL DEFAULT E'unknown',

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
"id" SERIAL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exercise" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmaIncompleteAlert" (
"id" SERIAL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchBatteryAlert" (
"id" SERIAL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineAlert" (
"id" SERIAL,
    "date" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "daysInStudy" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progress" (
"id" SERIAL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalMinMeditating" DECIMAL(65,30),
    "totalSessions" INTEGER,
    "hoursSinceLastPractice" INTEGER,
    "updatedByServer" BOOLEAN DEFAULT false,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Screen" (
"id" SERIAL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "screen" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "pushToken" TEXT,
    "window" JSONB NOT NULL,
    "messageSentToday" BOOLEAN NOT NULL DEFAULT false,
    "emaOneSentToday" BOOLEAN NOT NULL DEFAULT false,
    "emaTwoSentToday" BOOLEAN NOT NULL DEFAULT false,
    "inWindowToday" BOOLEAN NOT NULL DEFAULT false,
    "messageTypeToday" TEXT NOT NULL DEFAULT E'none',
    "messageToday" TEXT NOT NULL DEFAULT E'',
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "emaOneOpenedToday" BOOLEAN NOT NULL DEFAULT false,
    "emaOneCompletedToday" BOOLEAN NOT NULL DEFAULT false,
    "emaTwoCompletedToday" BOOLEAN NOT NULL DEFAULT false,
    "daysInStudy" INTEGER NOT NULL DEFAULT 0,
    "messageTimeToday" INTEGER NOT NULL DEFAULT 0,
    "emaOneReminderSentToday" BOOLEAN NOT NULL DEFAULT false,
    "emaTwoReminderSentToday" BOOLEAN NOT NULL DEFAULT false,
    "emaTwoOpenedToday" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.username_unique" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Message" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Randomization" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ema" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmaIncompleteAlert" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchBatteryAlert" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineAlert" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Screen" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
