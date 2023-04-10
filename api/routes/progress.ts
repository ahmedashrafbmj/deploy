import express from "express";
import validate from "../middleware/validation";
import { PrismaClient } from "@prisma/client";
import checkStudyWindow from "../middleware/checkStudyWindow";

// initialize prisma client
const prisma = new PrismaClient();
const router = express.Router();

// ========================================================================== //
// get user progress (all values)                                             //
// ========================================================================== //
router.get("/:id", validate, async (req, res) => {
  try {
    // obtain uuid from route parameters
    const uuid = req.params.id;

    // get total minutes
    const minutes = await prisma.progress.aggregate({
      sum: {
        totalMinMeditating: true,
      },
      where: {
        userId: uuid,
      },
    });
    const totalMinMeditating = minutes.sum.totalMinMeditating;

    // get total sessions
    const sessions = await prisma.progress.aggregate({
      sum: {
        totalSessions: true,
      },
      where: {
        userId: uuid,
      },
    });
    const totalSessions = sessions.sum.totalSessions;

    // get average minutes
    const avgMinutes = await prisma.progress.aggregate({
      avg: {
        totalMinMeditating: true,
      },
      where: {
        userId: uuid,
      },
    });
    const avgMinMeditating = avgMinutes.avg.totalMinMeditating;

    // get hours since last
    const hours = await prisma.progress.findMany({
      // ignore null entries
      where: { userId: uuid, NOT: [{ hoursSinceLastPractice: null }] },
      select: { hoursSinceLastPractice: true },
      take: -1,
    });
    const hoursSinceLastPractice = hours[0].hoursSinceLastPractice;

    // send aggregate response to client
    res.json({
      totalMinMeditating,
      totalSessions,
      avgMinMeditating,
      hoursSinceLastPractice,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ========================================================================== //
// get user minutes progress                                                  //
// ========================================================================== //
router.get("/:id/minutes", validate, async (req, res) => {
  try {
    // obtain uuid from route parameters
    const uuid = req.params.id;

    // aggregate values
    const query = await prisma.progress.aggregate({
      sum: {
        totalMinMeditating: true,
      },
      where: {
        userId: uuid,
      },
    });

    res.json(query);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// ========================================================================== //
// get user sessions progress                                                 //
// ========================================================================== //
router.get("/:id/sessions", validate, async (req, res) => {
  try {
    // obtain uuid from route parameters
    const uuid = req.params.id;

    // aggregate values
    const query = await prisma.progress.aggregate({
      sum: {
        totalSessions: true,
      },
      where: {
        userId: uuid,
      },
    });

    res.json(query);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// ========================================================================== //
// get user hours since last practice                                         //
// ========================================================================== //
router.get("/:id/hours", validate, async (req, res) => {
  try {
    // obtain uuid from route parameters
    const uuid = req.params.id;

    // get most recent hours record
    const query = await prisma.progress.findMany({
      where: {
        userId: uuid,
        updatedByServer: false,
        NOT: [{ hoursSinceLastPractice: null }],
      },
      select: {
        createdAt: true,
        hoursSinceLastPractice: true,
        updatedByServer: true,
      },
      take: -1,
    });

    res.json(query);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// ========================================================================== //
// get average minutes meditating                                             //
// ========================================================================== //
router.get("/:id/average-minutes", validate, async (req, res) => {
  try {
    // obtain uuid from route parameters
    const uuid = req.params.id;

    // aggregate values
    const query = await prisma.progress.aggregate({
      avg: {
        totalMinMeditating: true,
      },
      where: {
        userId: uuid,
      },
    });

    res.json(query);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// ========================================================================== //
// update total minutes meditating                                            //
// ========================================================================== //
router.post("/:id/minutes", checkStudyWindow, validate, async (req, res) => {
  try {
    // obtain uuid from route parameters
    const uuid = req.params.id;

    const value: number = +req.query.minutes;

    // add new record
    await prisma.progress.create({
      data: { user: { connect: { id: uuid } }, totalMinMeditating: +value },
    });

    // aggregate values
    const query = await prisma.progress.aggregate({
      sum: {
        totalMinMeditating: true,
      },
      where: {
        userId: uuid,
      },
    });

    res.json(query);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// ========================================================================== //
// update total sessions                                                      //
// ========================================================================== //
router.post("/:id/sessions", checkStudyWindow, validate, async (req, res) => {
  try {
    // obtain uuid from route parameters
    const uuid = req.params.id;

    const value: number = +req.query.sessions;

    // add new record
    await prisma.progress.create({
      data: { user: { connect: { id: uuid } }, totalSessions: +value },
    });

    // aggregate values
    const query = await prisma.progress.aggregate({
      sum: {
        totalSessions: true,
      },
      where: {
        userId: uuid,
      },
    });

    res.json(query);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// ========================================================================== //
// update hours since last                                                    //
// ========================================================================== //
router.post("/:id/hours", checkStudyWindow, validate, async (req, res) => {
  try {
    // obtain uuid from route parameters
    const uuid = req.params.id;

    const value: number = +req.query.hours;

    const { time, server } = req.body;

    console.log(time);
    console.log(server);

    // add new record
    await prisma.progress.create({
      data: {
        user: { connect: { id: uuid } },
        createdAt: time,
        hoursSinceLastPractice: +value,
        updatedByServer: server === true ? true : false,
      },
    });

    // get most recent hours record
    const query = await prisma.progress.findMany({
      where: { userId: uuid, NOT: [{ hoursSinceLastPractice: null }] },
      select: { hoursSinceLastPractice: true },
      take: -1,
    });

    res.json(query);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

export default router;
