import express from "express";
import validate from "../middleware/validation";
import { PrismaClient } from "@prisma/client";
import checkStudyWindow from "../middleware/checkStudyWindow";

// initialize prisma client
const prisma = new PrismaClient();
const router = express.Router();

// ========================================================================== //
// create EMA response record                                                 //
// ========================================================================== //
router.post("/:id", checkStudyWindow, validate, async (req, res) => {
  try {
    // obtain uuid from route parameters
    const uuid = req.params.id;

    const { set, prompt, responses, complete } = req.body;

    const query = await prisma.ema.create({
      data: {
        User: { connect: { id: uuid } },
        set,
        prompt,
        responses,
        complete,
      },
    });

    res.json(query);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

/**
 * Mark EMA set 1 opened
 */
router.post(
  "/:id/ema-one-opened",
  checkStudyWindow,
  validate,
  async (req, res) => {
    try {
      // obtain uuid from route parameters
      const uuid = req.params.id;

      // mark EMA set 1 opened
      const query = await prisma.user.update({
        where: { id: uuid },
        data: { emaOneOpenedToday: true },
      });

      res.json(query);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

/**
 * Check if EMA set 1 completed
 */
router.get(
  "/:id/ema-one-completed",
  checkStudyWindow,
  validate,
  async (req, res) => {
    try {
      // obtain uuid from route parameters
      const uuid = req.params.id;

      const query = await prisma.user.findUnique({
        where: { id: uuid },
        select: { emaOneCompletedToday: true },
      });

      res.json(query);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

/**
 * Mark EMA set 1 completed
 */
router.post(
  "/:id/ema-one-completed",
  checkStudyWindow,
  validate,
  async (req, res) => {
    try {
      // obtain uuid from route parameters
      const uuid = req.params.id;

      const query = await prisma.user.update({
        where: { id: uuid },
        data: { emaOneCompletedToday: true },
      });

      res.json(query);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

/**
 * Mark EMA set 2 opened
 */
router.post(
  "/:id/ema-two-opened",
  checkStudyWindow,
  validate,
  async (req, res) => {
    try {
      // obtain uuid from route parameters
      const uuid = req.params.id;

      const query = await prisma.user.update({
        where: { id: uuid },
        data: { emaTwoOpenedToday: true },
      });

      res.json(query);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

/**
 * Check if EMA set 2 completed
 */
router.get(
  "/:id/ema-two-completed",
  checkStudyWindow,
  validate,
  async (req, res) => {
    try {
      // obtain uuid from route parameters
      const uuid = req.params.id;

      const query = await prisma.user.findUnique({
        where: { id: uuid },
        select: { emaTwoCompletedToday: true },
      });

      res.json(query);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

/**
 * Mark EMA set 2 completed
 */
router.post(
  "/:id/ema-two-completed",
  checkStudyWindow,
  validate,
  async (req, res) => {
    try {
      // obtain uuid from route parameters
      const uuid = req.params.id;

      const query = await prisma.user.update({
        where: { id: uuid },
        data: { emaTwoCompletedToday: true },
      });

      res.json(query);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

/**
 * Update EMA reminder flag
 */
router.post("/:id/reminder", checkStudyWindow, validate, async (req, res) => {
  try {
    // obtain uuid from route parameters
    const uuid = req.params.id;

    // EMA set (1 or 2)
    const { set } = req.body;

    let query;
    if (set === "one") {
      // mark EMA 1 reminder sent
      query = await prisma.user.update({
        where: { id: uuid },
        data: { emaOneReminderSentToday: true },
      });
    } else if (set === "two") {
      // mark EMA 2 reminder sent
      query = await prisma.user.update({
        where: { id: uuid },
        data: { emaTwoReminderSentToday: true },
      });
    }

    res.json(query);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

export default router;
