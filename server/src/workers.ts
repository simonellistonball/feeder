import { YogaInitialContext } from "graphql-yoga";
import { GraphQLContext } from "./schema";
import { logger } from "./logger";

const { WORKER_SERVER_URL } = process.env;
if (!WORKER_SERVER_URL) {
  throw new Error("WORKER_SERVER_URL is not defined");
}

export function postWorkerJob(jobName: string, argsToPass: string[] = []) {
  return async (
    _,
    args: Record<string, unknown>,
    context: GraphQLContext & YogaInitialContext
  ) => {
    const { user, jwt } = context;
    if (!(user || jwt)) {
      throw new Error("Unauthorized");
    }
    const userId = (user?.id || jwt?.payload._id) ?? "";
    logger.info(`refreshGmail for ${userId}`);

    const data = Object.fromEntries(
      Object.entries(args).filter(([key]) => argsToPass.includes(key))
    );

    // call the api in the job server that receives the authentication credentials and job details and kicks off the listing
    const job = {
      name: jobName,
      data: {
        ...data,
        userId: userId,
      },
    };
    const headers = { "Content-Type": "application/json" };
    return fetch(WORKER_SERVER_URL!, {
      method: "POST",
      headers,
      body: JSON.stringify(job),
    }).then((response) => {
      return {
        success: response.status === 202,
        status: response.status,
        message: response.statusText,
      };
    });
  };
}
