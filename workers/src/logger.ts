import { createLogger, transports, format } from "winston";

// import { KafkaTransport, KafkaTransportConfig } from "winston-logger-kafka";
// const kafka = process.env.KAFKA_BROKERS
//   ? () => {
//       console.log("KAFKA_BROKERS", process.env.KAFKA_BROKERS);
//       const kafka_transport_conf: KafkaTransportConfig = {
//         clientConfig: { brokers: [process.env.KAFKA_BROKERS!] },
//         producerConfig: { allowAutoTopicCreation: true },
//         sinkTopic: "server_logs",
//       };
//       return [new KafkaTransport(kafka_transport_conf)];
//     }
//   : () => [];

export const logger = createLogger({
  level: "debug",
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.json(),
        format.prettyPrint(),
        format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    }),
    new transports.File({
      filename: "logs/server.log",
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});
