import { logger } from "./logger";
import { fetchQueue } from "./queues";

// load the gmail_message queue jobs, and resplit them by user id
export async function rebatcher() {
  const oldJobs: string[] = [];

  const all = await fetchQueue.getJobs(["waiting"]);
  logger.info(`there are ${all.length} waiting jobs`);

  await fetchQueue.getJobs(["waiting"]).then(async (jobs) => {
    const jobsToRebatch = jobs
      .filter((job) => job.data.messages.length > 10)
      .map((job) => {
        const { userId, messages } = job.data;
        oldJobs.push(job.id!);
        return { [userId]: messages };
      });

    logger.info(`Rebatching ${jobsToRebatch.length} jobs`);

    // group all the messages by user id so we have a combination of all the messages for a user
    const jobsByUser = jobsToRebatch.reduce((acc, job) => {
      const userId = Object.keys(job)[0];
      const messages = job[userId];
      if (acc.has(userId)) {
        const old = acc.get(userId) || [];
        acc.set(userId, [...old, ...messages]);
      } else {
        acc.set(userId, messages);
      }
      return acc;
    }, new Map<string, string[]>());

    logger.info(`Rebatching ${jobsByUser.size} users`);

    // now we have a map of user ids to messages, we can create new jobs for each user
    await Promise.all(
      Array.from(jobsByUser).map(async ([userId, messages]) => {
        // chunk messages into groups of 25
        const chunks = [];
        while (messages.length > 0) {
          chunks.push(messages.splice(0, 10));
        }
        // create a new job for each chunk
        chunks.forEach(async (chunk) => {
          const job = await fetchQueue.add("gmail_message", {
            userId,
            messages: chunk,
          });
        });
      })
    );
  });

  // now remove all the old ones
  await Promise.all(
    oldJobs.map((jobId) => {
      logger.info(`removing job ${jobId}`);
      return fetchQueue.remove(jobId);
    })
  );
}
