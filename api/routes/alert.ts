import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import validate from "../middleware/validation";
import checkStudyWindow from "../middleware/checkStudyWindow";

// initialize express router
const router = express.Router();

// initialize prisma client
const prisma = new PrismaClient();

/**
 * Handle a generic alert request.
 *
 * @param {Request} req request
 * @param {Response} res response
 * @param dbModel Prisma database model object to query
 * @param {string} name name for Content-Range header
 */
const fetchAlerts = async (
  req: Request,
  res: Response,
  dbModel: { [key: string]: any },
  name: string
) => {
  try {
    // destructure query parameters
    const { perPage, range, filter, sort } = req.query;

    // range query
    const rangeQuery: number[] = JSON.parse(range as string);

    // filter query
    const {
      username: usernameFilter,
      startDate: start,
      endDate: end,
    } = JSON.parse(filter as string);

    // start and end date for filter range
    const startDate = new Date(start);
    let endDate = new Date(end);
    endDate.setDate(endDate.getDate() + 1);

    // filter schema for results + Content-Range header
    const filterSchema = {
      User: {
        username: { contains: usernameFilter },
      },
      createdAt: {
        gte: start ? startDate : undefined,
        lte: end ? endDate : undefined,
      },
    };

    // sort parameters
    const [sortId, sortMethod]: string[] = JSON.parse(sort as string);

    const allAlerts = await dbModel.findMany({
      include: { User: { select: { username: true } } },
      // pagination
      skip: rangeQuery ? rangeQuery[0] : 0,
      take: perPage ? JSON.parse(perPage as string) : 10,
      // sort data
      orderBy: sortId ? { [sortId]: sortMethod.toLowerCase() } : {},
      // filter data
      where: { ...filterSchema },
    });

    // get total count and set `Content-Range` response header
    const totalAlertCount = await dbModel.count({
      where: { ...filterSchema },
    });

    res.header(
      "Content-Range",
      `${name} 0-${totalAlertCount}/${totalAlertCount}`
    );

    res.json(allAlerts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

/**
 * GET all EMA completion failure alerts
 */
router.get("/ema", validate, async (req, res) => {
  await fetchAlerts(req, res, prisma.emaIncompleteAlert, "ema");
});

/**
 * GET 15/30 day (timeline) alerts
 */
router.get("/timeline", validate, async (req, res) => {
  await fetchAlerts(req, res, prisma.timelineAlert, "timeline");
});

/**
 * GET all watch data alerts
 */
router.get("/watch", validate, async (req, res) => {
  await fetchAlerts(req, res, prisma.watchBatteryAlert, "watch");
});

/**
 * POST daily EMA completion failure alert
 */
router.post("/ema/:id", validate, async (req, res) => {
  try {
    // obtain uuid from params
    const uuid = req.params.id;

    // create EMA alert record
    const query = await prisma.emaIncompleteAlert.create({
      data: {
        User: { connect: { id: uuid } },
      },
    });

    res.json(query);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * POST watch data alert
 */
router.post("/watch/:id", validate, async (req, res) => {
  try {
    // obtain uuid from params
    const uuid = req.params.id;

    // create watch data alert record
    const query = await prisma.watchBatteryAlert.create({
      data: {
        User: { connect: { id: uuid } },
      },
    });

    res.json(query);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * POST mark alert record as "seen"
 */
router.post("/seen", validate, async (req, res) => {
  try {
    // alert type and database IDs for proper database table querying
    const { type, ids }: Partial<{ type: string; ids: string }> = req.query;

    // convert `ids` query param into array of strings, then convert to numbers
    const idsArray = ids.split(",").map((id) => +id);

    let dbModel;
    switch (type.toLowerCase()) {
      case "ema":
        dbModel = prisma.emaIncompleteAlert;
        break;
      case "timeline":
        dbModel = prisma.timelineAlert;
        break;
      case "watch data":
        dbModel = prisma.watchBatteryAlert;
        break;
      default:
        break;
    }

    // mark record as seen
    const query = await dbModel.updateMany({
      where: { id: { in: idsArray } },
      data: { seen: true },
    });

    res.json(query);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

export default router;
