import express from "express";
import validate from "../middleware/validation";
import { PrismaClient } from "@prisma/client";
import checkStudyWindow from "../middleware/checkStudyWindow";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * Record screen interaction in database
 */
router.post("/:id", checkStudyWindow, validate, async (req, res) => {
  try {
    // obtain uuid from route parameters
    const uuid = req.params.id;

    const screen: any = req.query.screen;

    const query = await prisma.screen.create({
      data: { User: { connect: { id: uuid } }, screen: screen },
    });

    res.json(query);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

export default router;
