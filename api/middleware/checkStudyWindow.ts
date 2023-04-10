import { PrismaClient } from "@prisma/client";

// initialize prisma client
const prisma = new PrismaClient();

/**
 * Verify user is within 30-day study cycle
 */
const checkStudyWindow = async (req, res, next) => {
  const userId = req.params.id;

  const { daysInStudy } = await prisma.user.findUnique({
    where: { id: userId },
    select: { daysInStudy: true },
  });

  // return error if user does not exist, daysInStudy does not exist, or daysInStudy greater than 30 days (outside of window)
  if (userId && daysInStudy && daysInStudy > 30)
    return res.status(403).json(`User ${userId} no longer in study window`);

  next();
};

export default checkStudyWindow;
