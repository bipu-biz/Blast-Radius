import { Redis } from "ioredis";

const connection = new Redis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null,
});

export default connection;