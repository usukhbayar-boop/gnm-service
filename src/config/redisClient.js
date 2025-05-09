// redisClient.js
const { createClient } = require("redis");

const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis error:", err));

async function connectRedis() {
  await redisClient.connect();
  console.log("Redis connected");
}

connectRedis(); // Safe async call

module.exports = { redisClient };
