import * as jwt from "jsonwebtoken";

const authorize = async (req, res, next) => {
  try {
    const jwtToken = req.header("token");

    // exit if no JWT
    if (!jwtToken) return res.status(403).json("Not authorized");

    // verify JWT
    const payload: any = jwt.verify(jwtToken, process.env.JWT_SECRET);

    req.user = payload.user;
    next();
  } catch (err) {
    console.error(err.message);
    return res.status(403).json("Not authorized");
  }
};

export default authorize;
