import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import serverless from "serverless-http";

import authRouter from "./routes/auth";
import pushRouter from "./routes/push";
import progressRouter from "./routes/progress";
import screenRouter from "./routes/screen";
import emaRouter from "./routes/ema";
import ratingRouter from "./routes/rating";
import alertRouter from "./routes/alert";

// initialize express
const app = express();

// set up dotenv
dotenv.config();

// server port
const port = process.env.PORT || 3000;

// headers
app.use((req, res, next) => {
  // CORS
  const allowedOrigins = [
    "http://localhost:3000",
    "https://master.d5x6a89bl7jwe.amplifyapp.com",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, X-Amz-Date, Content-Type, Accept, Authorization, X-Api-Key, X-Amz-Security-Token, Content-Range, Range, range"
  );
  res.header("Access-Control-Expose-Headers", "Content-Range");

  next();
});

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cors());

// routes
app.use("/auth", authRouter);
app.use("/push", pushRouter);
app.use("/progress", progressRouter);
app.use("/screen", screenRouter);
app.use("/ema", emaRouter);
app.use("/rating", ratingRouter);
app.use("/alert", alertRouter);

// root route
app.get("/", (_req, res) => {
  res.json({ message: "apt.mind API is running" });
});

app.listen(port, () => console.log(`Server listening on port ${port}`));

// lambda handler
module.exports.handler = serverless(app);
