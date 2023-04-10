import request from "supertest";

import app from "../server";

declare global {
  namespace NodeJS {
    interface Global {
      signup: () => Promise<string[]>;
    }
  }
}

global.signup = async () => {
  const username = "testuser";
  const password = "password";

  const res = await request(app)
    .post("/auth/register")
    .send({ username, password })
    .expect(201);

  const token = res.token;
  return token;

  //   const cookie = res.get("Set-Cookie");
  //   return cookie;
};
