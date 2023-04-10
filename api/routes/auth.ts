import express from "express";
import * as bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

import jwtGenerator from "./util/jwtGenerator";
import validate from "../middleware/validation";
import authorize from "../middleware/authorization";
import { generateWindow } from "../lib/util";
import { WeekWindows } from "../lib/types";
import filterEmaSets from "../lib/util/filterEmaSets";
import checkStudyWindow from "../middleware/checkStudyWindow";

// initialize express router
const router = express.Router();

// initialize prisma client
const prisma = new PrismaClient();

/**
 * GET: get all users
 */
router.get("/all", validate, async (req, res) => {
  try {
    // destructure query parameters
    const { perPage, range, filter, sort } = req.query;

    // range query
    const rangeQuery: number[] = range && JSON.parse(range as string);

    // filter query
    const { username: usernameFilter } = filter
      ? JSON.parse(filter as string)
      : "";

    // filter schema for results + Content-Range header
    const filterSchema = usernameFilter && {
      username: { contains: usernameFilter },
    };

    // sort parameters
    const [sortId, sortMethod]: string[] = sort
      ? JSON.parse(sort as string)
      : [];

    const users = await prisma.user.findMany({
      // pagination
      skip: rangeQuery ? rangeQuery[0] : 0,
      take: perPage ? JSON.parse(perPage as string) : undefined,
      // sort data
      orderBy: sortId ? { [sortId]: sortMethod.toLowerCase() } : {},
      // filter data
      where: {
        username: {
          // username filter, if applicable
          ...(filterSchema && filterSchema.username),
          // always filter out non-participant IDs
          notIn: ["apple", "ZGoof3i7DmmS2LdR"],
        },
      },
    });

    const totalUserCount = await prisma.user.count({
      where: { ...filterSchema },
    });

    res.header("Content-Range", `users 0-${totalUserCount}/${totalUserCount}`);

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/all/:id", validate, async (req, res) => {
  try {
    const userId = req.params.id;

    const query = await prisma.user.findUnique({
      where: { id: userId },
    });

    res.json(query);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * POST: reset user randomization (mark for randomization)
 */
router.post("/:id/reset-randomization", validate, async (req, res) => {
  try {
    const userId = req.params.id;
    const query = await prisma.user.update({
      where: { id: userId },
      data: { randomizedToday: false },
    });

    res.json(query);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * POST: update user data after randomization
 */
router.post("/:id/randomization", validate, async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      message,
      messageType,
      messageTime,
      windowChance,
      daysInStudy,
    } = req.body;

    const incrementedDaysInStudy = daysInStudy + 1;

    // log timeline alert if 15 or 30 days in study
    // check 16th randomization so that sets completed on 15 are counted
    if (incrementedDaysInStudy === 16) {
      // get snapshot number of completed EMA sets
      const completedEmaSets = await prisma.ema.findMany({
        where: { userId, complete: true },
        select: { createdAt: true },
      });

      const filteredEmaSets = filterEmaSets(completedEmaSets);

      // create 15-day alert record
      await prisma.timelineAlert.create({
        data: {
          User: { connect: { id: userId } },
          daysInStudy: 15,
          setsCompleted: filteredEmaSets,
        },
      });
      // check 31st randomization so that sets completed on 30 are counted
    } else if (incrementedDaysInStudy === 31) {
      // get timestamp of previous timeline alert (15 days)
      const previousAlert = await prisma.timelineAlert.findMany({
        where: {
          userId,
          daysInStudy: 15,
        },
      });
      const previousAlertTimestamp = previousAlert[0].createdAt;

      // get snapshot number of completed EMA sets
      const completedEmaSets = await prisma.ema.findMany({
        where: {
          userId,
          complete: true,
          // get number of sets since last timeline alert (15 days)
          createdAt: { gt: previousAlertTimestamp },
        },
        select: { createdAt: true },
      });

      const filteredEmaSets = filterEmaSets(completedEmaSets);

      // create 30-day alert record
      await prisma.timelineAlert.create({
        data: {
          User: { connect: { id: userId } },
          daysInStudy: 30,
          setsCompleted: filteredEmaSets,
        },
      });
    }

    // record scheduled randomization
    await prisma.randomization.create({
      data: {
        User: { connect: { id: userId } },
        message,
        messageType,
        messageTime,
      },
    });

    // update user table
    const query = await prisma.user.update({
      where: { id: userId },
      data: {
        inWindowToday: windowChance,
        messageTypeToday: messageType,
        messageTimeToday: messageTime,
        messageToday: message,
        // increment passed in days in study
        daysInStudy: incrementedDaysInStudy,
        randomizedToday: true,
        messageSentToday: false,
        emaOneSentToday: false,
        emaOneReminderSentToday: false,
        emaOneOpenedToday: false,
        emaOneCompletedToday: false,
        emaTwoSentToday: false,
        emaTwoReminderSentToday: false,
        emaTwoOpenedToday: false,
        emaTwoCompletedToday: false,
      },
    });

    res.json(query);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * POST: register a user
 */
router.post("/register", validate, async (req, res) => {
  try {
    // destructure request body (login credentials)
    const { username, password } = req.body;

    // query username against database
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    // check if user already exists
    if (user !== null) return res.status(401).send("User already exists.");

    // bcrypt salt and hash user password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPw = await bcrypt.hash(password, salt);

    // add user to database
    const newUser = await prisma.user.create({
      data: {
        username: username,
        password: hashedPw,
        window: {},
        progress: { create: { hoursSinceLastPractice: 0 } },
        messages: { create: [] },
        ema: { create: [] },
        screens: { create: [] },
        ratings: { create: [] },
      },
    });

    // generate JWT
    const token = jwtGenerator(newUser.id);

    // send JWT to client
    res.status(201).json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * POST: login a user
 */
router.post("/login", validate, async (req, res) => {
  try {
    // destructure request body (login credentials)
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    // check if user does not exist
    if (user === null)
      return res.status(401).json("Username or password is incorrect.");

    // verify password
    const validPw = await bcrypt.compare(password, user.password);

    if (!validPw)
      return res.status(401).json("Username or password is incorrect.");

    // generate JWT
    const token = jwtGenerator(user.id);

    const userId = user.id;

    const admin = user.admin;

    // send JWT to client
    res.json({ token, userId, admin });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * GET: verify JWT
 */
router.get("/verify", authorize, async (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * POST: generate user window
 */
router.post("/:id/window/seed", validate, async (req, res) => {
  try {
    const userId = req.params.id;
    // window seed
    const { seed }: { seed: WeekWindows } = req.body;

    // store generated user window
    const query = await prisma.user.update({
      where: { id: userId },
      data: {
        window: generateWindow(seed),
      },
    });

    res.json(query);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * Delete user by ID.
 */
// router.delete("/:id", () => {});

export default router;
