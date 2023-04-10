import * as jwt from "jsonwebtoken";

// generate and sign JSON Web Token
const jwtGenerator = (id) => {
  const payload = {
    user: id,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1hr" });
};

export default jwtGenerator;
