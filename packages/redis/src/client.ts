import { createClient, type RedisClientType as RedisClient } from "redis";
import type { RedisConfig } from "./types";

export type RedisClientType = RedisClient;

let client: RedisClientType | null = null;

export const createRedisClient = async (
  config: RedisConfig,
): Promise<RedisClientType> => {
  if (client) {
    return client;
  }

  client = createClient({
    socket: {
      host: config.host,
      port: config.port,
    },
    password: config.password,
    database: config.db || 0,
  });

  await client.connect();

  client.on("error", (err) => {
    console.error("Redis Client Error:", err);
  });

  return client;
};
