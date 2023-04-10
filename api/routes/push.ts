import express from "express";
import { PrismaClient } from "@prisma/client";
import { Expo } from "expo-server-sdk";

import validate from "../middleware/validation";
import checkStudyWindow from "../middleware/checkStudyWindow";

const expo = new Expo();
const prisma = new PrismaClient();
const router = express.Router();

router.get("/:id", validate, async (req, res) => {
  try {
    const userId = req.params.id;

    const messageData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        pushToken: true,
        messageTypeToday: true,
        messageToday: true,
        messageTimeToday: true,
        messageSentToday: true,
        inWindowToday: true,
      },
    });

    res.json(messageData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * get all user messages
 */
router.get("/:id/messages", validate, async (req, res) => {
  try {
    const userId = req.params.id;

    const messages = await prisma.message.findMany({
      where: { userId: userId },
    });

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/token", validate, async (req, res) => {
  try {
    // obtain uuid and push token from body
    const uuid = req.body.id;
    const token = req.body.token;

    // store token in database
    const updateToken = await prisma.user.update({
      where: { id: uuid },
      data: { pushToken: token },
    });

    res.json({ updateToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * send push notification to user
 */
router.post("/:id", checkStudyWindow, validate, async (req, res) => {
  try {
    const userId = req.params.id;
    const { title, body, type } = req.body;

    let notifications = [];

    // get user push token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushToken: true },
    });
    const token = user.pushToken;

    // verify push token validity
    if (!Expo.isExpoPushToken(user.pushToken)) {
      console.error(
        `Push token '${user.pushToken}' is not a valid Expo push token.`
      );
    }

    notifications.push({
      to: user.pushToken,
      sound: "default",
      title: title,
      body: body,
      data: { type },
    });

    const chunks = expo.chunkPushNotifications(notifications);

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
      } catch (err) {
        console.error(err);
      }
    }

    res.json({
      message: `Sent title: '${title}' and body: '${body}' to user ${userId} with push token ${token}`,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * record message in database
 */
router.post("/:id/record", checkStudyWindow, validate, async (req, res) => {
  try {
    const userId = req.params.id;
    const { messageType, messageBody, inWindow } = req.body;

    const query = await prisma.user.update({
      where: { id: userId },
      data: {
        messages: {
          create: {
            type: messageType,
            message: messageBody,
            inWindow: inWindow,
          },
        },
        messageSentToday: true,
      },
    });

    res.json(query);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * record EMA one in database
 */
router.post("/:id/ema-one", checkStudyWindow, validate, async (req, res) => {
  try {
    const userId = req.params.id;
    const { messageType, messageBody, inWindow } = req.body;

    const query = await prisma.user.update({
      where: { id: userId },
      data: {
        messages: {
          create: {
            type: messageType,
            message: messageBody,
            inWindow: inWindow,
          },
        },
        emaOneSentToday: true,
      },
    });

    res.json(query);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * record EMA two in database
 */
router.post("/:id/ema-two", checkStudyWindow, validate, async (req, res) => {
  try {
    const userId = req.params.id;
    const { messageType, messageBody, inWindow } = req.body;

    const query = await prisma.user.update({
      where: { id: userId },
      data: {
        messages: {
          create: {
            type: messageType,
            message: messageBody,
            inWindow: inWindow,
          },
        },
        emaTwoSentToday: true,
      },
    });

    res.json(query);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

export default router;
