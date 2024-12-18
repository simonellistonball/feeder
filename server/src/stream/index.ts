import { Kafka, CompressionTypes } from "kafkajs";
import { logger } from "../logger";

export interface ChangeEvent {
  type: "add" | "remove" | "update";
  model: string;
  key: string;
  oldValue?: Record<string, string | number | boolean | Date>;
  value: Record<string, string | number | boolean | Date>;
}

const { KAFKA_BROKERS } = process.env;
if (!KAFKA_BROKERS) {
  throw new Error("KAFKA_BROKERS is not set");
}

const kafka = new Kafka({
  clientId: "feeder-server",
  brokers: KAFKA_BROKERS.split(","),
});

const producer = kafka.producer();
await producer.connect();

export default async function stream(
  event: ChangeEvent,
  topic: string
): Promise<void> {
  // use the event key first, since this is a uuid, and should be fairly randomly distributed
  const key = `${event.key}:${event.model}:${new Date().toISOString()}`;
  const message = JSON.stringify(event);
  await producer
    .send({
      topic,
      compression: CompressionTypes.GZIP,
      messages: [{ key: key, value: message }],
    })

    .catch((e) => logger.error(`[kafka\producer] ${e.message}`, e));
}
