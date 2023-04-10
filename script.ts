import util from "util";
import { PrismaClient } from "@prisma/client";

import { DayWindows, WeekWindows } from "./api/lib/types";
import { generateWindow } from "./api/lib/util";

const prisma = new PrismaClient();

const weekWindow: DayWindows = {
  overnight: false,
  globalStartHour: "08",
  globalEndHour: "22",
  localHours: [["18", "20", false]],
};

const weekendWindow: DayWindows = {
  overnight: false,
  globalStartHour: "08",
  globalEndHour: "22",
  localHours: [["18", "20", false]],
};

const participantWindowSeed: WeekWindows = {
  dateBeforeStudy: "20210908",
  monday: weekWindow,
  tuesday: weekWindow,
  wednesday: weekWindow,
  thursday: weekWindow,
  friday: weekWindow,
  saturday: weekendWindow,
  sunday: weekendWindow,
};

const updateUserWindow = async (id: string) => {
  // TODO implement window schema validation

  await prisma.user.update({
    where: { username: id },
    data: {
      window: generateWindow(participantWindowSeed),
    },
  });
};

const augmentUserWindow = async (id: string) => {
  const { window } = await prisma.user.findUnique({
    where: { username: id },
    select: { window: true },
  });

  // window["7"] = [[1622055600, 1622124000], [[1622062800, 1622070000]]];
  // window["8"] = [[1622142000, 1622210400], [[1622149200, 1622156400]]];
  // window["9"] = [[1622228400, 1622257200], [[1622235600, 1622242800]]];

  console.log(window, typeof window);

  await prisma.user.update({
    where: { username: id },
    data: {
      window,
    },
  });
};

const main = async () => {
  // UPDATE "User" SET "randomizedToday" = false, "daysInStudy" = 0 WHERE "username" = 'brian';
  console.log("Updating participant window...");

  // console.log(
  //   util.inspect(generateWindow(participantWindowSeed), false, null, true)
  // );

  // await updateUserWindow("nicole");

  // 63311 SPECIAL CASE
  // await augmentUserWindow("63311");

  // const newWindow = {
  //   "1": [[1629111600, 1629169200], [[1629154800, 1629162000]]],
  //   "2": [[1629198000, 1629255600], [[1629241200, 1629248400]]],
  //   "3": [[1629284400, 1629342000], [[1629327600, 1629334800]]],
  //   "4": [[1629370800, 1629428400], [[1629414000, 1629421200]]],
  //   "5": [[1629460800, 1629514800], [[1629500400, 1629507600]]],
  //   "6": [[1629547200, 1629601200], [[1629586800, 1629594000]]],
  //   "7": [[1629633600, 1629687600], [[1629673200, 1629680400]]],
  //   "8": [[1629716400, 1629774000], [[1629759600, 1629766800]]],
  //   "9": [[1629802800, 1629860400], [[1629846000, 1629853200]]],
  //   "10": [[1629889200, 1629946800], [[1629932400, 1629939600]]],
  //   "11": [[1629979200, 1630033200], [[1630018800, 1630026000]]],
  //   "12": [[1630062000, 1630119600], [[1630105200, 1630112400]]],
  //   "13": [[1630152000, 1630206000], [[1630191600, 1630198800]]],
  //   "14": [[1630238400, 1630292400], [[1630278000, 1630285200]]],
  //   "15": [[1630324800, 1630378800], [[1630364400, 1630371600]]],
  //   "16": [[1630407600, 1630465200], [[1630450800, 1630458000]]],
  //   "17": [[1630497600, 1630551600], [[1630537200, 1630544400]]],
  //   "18": [[1630580400, 1630638000], [[1630623600, 1630630800]]],
  //   "19": [[1630666800, 1630724400], [[1630710000, 1630717200]]],
  //   "20": [[1630753200, 1630810800], [[1630796400, 1630803600]]],
  //   "21": [[1630839600, 1630897200], [[1630882800, 1630890000]]],
  //   "22": [[1630929600, 1630983600], [[1630969200, 1630976400]]],
  //   "23": [[1631016000, 1631070000], [[1631055600, 1631062800]]],
  //   "24": [[1631102400, 1631156400], [[1631142000, 1631149200]]],
  //   "25": [[1631188800, 1631242800], [[1631228400, 1631235600]]],
  //   "26": [[1631275200, 1631329200], [[1631314800, 1631322000]]],
  //   "27": [[1631361600, 1631415600], [[1631401200, 1631408400]]],
  //   "28": [[1631448000, 1631502000], [[1631487600, 1631494800]]],
  //   "29": [[1631534400, 1631588400], [[1631574000, 1631581200]]],
  //   "30": [[1631620800, 1631674800], [[1631660400, 1631667600]]],
  // };

  // await prisma.user.update({
  //   where: { username: "610821" },
  //   data: { window: newWindow },
  // });

  console.log("Done.");

  process.exit(0);
};

try {
  main();
} catch (err) {
  console.error(err);
} finally {
}
