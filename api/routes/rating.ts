import express from "express";
import { PrismaClient } from "@prisma/client";

import validate from "../middleware/validation";
import checkStudyWindow from "../middleware/checkStudyWindow";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * Create activity rating record for user
 */
router.post("/:id", checkStudyWindow, validate, async (req, res) => {
  try {
    // obtain uuid from params
    const uuid = req.params.id;

    // get activity name and rating query strings
    const { activity, rating }: any = req.query;

    const query = await prisma.rating.create({
      data: {
        User: { connect: { id: uuid } },
        exercise: activity,
        rating,
      },
    });

    res.json(query);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

export default router;
