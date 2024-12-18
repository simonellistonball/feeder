import { Worker } from "bullmq";
import IORedis from "ioredis";

const redisUrl = new URL(process.env.REDIS_URL!);
const connection = new IORedis(parseInt(redisUrl.port), redisUrl.host, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "Google Doc Fetcher",
  async (job) => {
    // this job will connect to a user's google docs, and queue the docs they have available for analysis
    console.log(job.data);
  },
  { connection }
);
