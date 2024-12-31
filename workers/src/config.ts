const redisUrl = new URL(`${process.env.REDIS_URL!}`);

export const redisConfig = {
  connection: { host: redisUrl.hostname, port: parseInt(redisUrl.port) },
};

export const workerConfig = (telemetryName: string) => ({
  ...redisConfig,
});

export const queueConfig = (telemetryName: string) => ({
  ...redisConfig,
});
