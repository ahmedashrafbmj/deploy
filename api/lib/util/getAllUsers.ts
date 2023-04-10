import fetch from "node-fetch";

/**
 * Get all users via API.
 */
const getAllUsers = async () => {
  const res = await fetch(`${process.env.API_BASE_URL}/auth/all`, {
    headers: {
      "x-api-key": `${process.env.API_KEY}`,
    },
  });
  const users = await res.json();

  return users;
};

export default getAllUsers;
