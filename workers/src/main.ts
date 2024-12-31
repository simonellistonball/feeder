// setup dotenv
import "dotenv/config";

import workers from "./workers";
type WorkerKey = keyof typeof workers;

import { Command, CommanderError } from "commander";
import { logger } from "./logger";
import { fetchQueue } from "./queues";
import { rebatcher } from "./rebatcher";
import { otelSetup } from "./otel";
const program = new Command();
const availableWorkersHelp = `Available worker:
    ${Object.keys(workers).join("\n    ")}`;
try {
  program
    .name("Worker runner")
    .description(
      "Runs one or more of the bullmq workers that process background jobs"
    )
    .option("-v, --verbose", "verbose")
    .option("-h, --help", "help")
    // make the workers option required and allow multiple workers to be specified
    .requiredOption("-w, --workers <workers...>", "workers")
    .option("--rebatch", "rebatch all jobs in the queue")
    .addHelpText("after", availableWorkersHelp)
    .showHelpAfterError()
    .parse(process.argv);
  program.exitOverride();

  const options = program.opts();

  if (options.verbose) {
    console.log(options);
    console.log("running workers: ", options.workers);
  }

  console.log(options);

  if (options.rebatch) {
    otelSetup();
    await rebatcher();
    process.exit(0);
  }

  if (options.workers) {
    otelSetup();

    options.workers.forEach((option: WorkerKey) => {
      if (option in workers) {
        try {
          workers[option]();
        } catch (err) {
          logger.error(`Error running worker ${option}: ${err}`);
        }
      } else {
        console.error(`Unknown worker: ${option}
        ${availableWorkersHelp}`);
      }
    });
  }
} catch (err) {
  if (
    err instanceof CommanderError &&
    err.code === "commander.missingMandatoryOptionValue"
  ) {
    program.outputHelp();
    process.exit(1);
  } else {
    console.error("Something when wrong: ", err);
  }
}
