import { createYoga } from "graphql-yoga";
import { schema } from "./schema";
import { useSofa } from "@graphql-yoga/plugin-sofa";
import {
  createInlineSigningKeyProvider,
  extractFromHeader,
  useJWT,
} from "@graphql-yoga/plugin-jwt";
import { useCookies } from "@whatwg-node/server-plugin-cookies";
import { usePrometheus } from "@graphql-yoga/plugin-prometheus";
import { db } from "./db";
import { logger } from "./logger";
import { getSession, Session, User } from "@auth/express";
import { authConfig } from "./config/auth.config";
import { eq } from "drizzle-orm";
import { sessions } from "./db/schema";

const signingKey = process.env.JWT_SECRET_KEY;
if (!signingKey) {
  throw new Error("JWT_SECRET_KEY environment variable is not set");
}
if (signingKey.length < 32) {
  throw new Error("JWT_SECRET_KEY environment variable is not long enough");
}

const plugins =
  process.env.NODE_ENV == "production" && signingKey
    ? [
        usePrometheus({
          endpoint: "/metrics", // optional, default is `/metrics`, you can disable it by setting it to `false` if registry is configured in "push" mode
          // Optional, see default values below
          metrics: {
            // By default, these are the metrics that are enabled:
            graphql_envelop_request_time_summary: true,
            graphql_envelop_phase_parse: true,
            graphql_envelop_phase_validate: true,
            graphql_envelop_phase_context: true,
            graphql_envelop_phase_execute: true,
            graphql_envelop_phase_subscribe: true,
            graphql_envelop_error_result: true,
            graphql_envelop_deprecated_field: true,
            graphql_envelop_request_duration: true,
            graphql_envelop_schema_change: true,
            graphql_envelop_request: true,
            graphql_yoga_http_duration: true,

            // This metric is disabled by default.
            // Warning: enabling resolvers level metrics will introduce significant overhead
            graphql_envelop_execute_resolver: false,
          },
        }),
      ]
    : [];

export const yoga = createYoga({
  schema,
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["POST"],
  },
  landingPage: false,
  logging: {
    debug(...args) {
      logger.debug(args[0], ...args);
    },
    info(...args) {
      logger.info(args[0], ...args);
    },
    warn(...args) {
      logger.warn(args[0], ...args);
    },
    error(...args) {
      logger.error(args[0], ...args);
    },
  },
  plugins: [
    useSofa({
      basePath: "/rest",
      openAPI: {
        info: {
          title: "Feeder API",
          description: "REST based API to augment graphql api",
          version: "1.0.0",
        },
      },
      swaggerUI: {
        endpoint: "/swagger",
      },
    }),
    useCookies(),
    useJWT({
      // Configure your signing providers: either a local signing-key or a remote JWKS are supported.
      signingKeyProviders: [createInlineSigningKeyProvider(signingKey)],
      // Configure where to look for the JWT token: in the headers, or cookies.
      // By default, the plugin will look for the token in the 'authorization' header only.
      tokenLookupLocations: [
        extractFromHeader({ name: "authorization", prefix: "Bearer" }),
      ],
      // Configure your token issuers/audience/algorithms verification options.
      // By default, the plugin will only verify the HS256/RS256 algorithms.
      // Please note that this should match the JWT signer issuer/audience/algorithms.
      tokenVerification: {
        issuer: "https://feeder.simonellistonball.com",
        audience: "api",
        algorithms: ["HS256", "RS256"],
      },
      // Configure context injection after the token is verified.
      // By default, the plugin will inject the token's payload into the context into the `jwt` field.
      // You can pass a string: `"myJwt"` to change the field name.
      extendContext: true,
      // The plugin can reject the request if the token is missing or invalid (doesn't pass JWT `verify` flow).
      // By default, the plugin will reject the request if the token is missing or invalid.
      reject: {
        missingToken: true,
        invalidToken: true,
      },
    }),
    ...plugins,
  ],
  graphiql: {
    // Use WebSockets in GraphiQL
    subscriptionsProtocol: "WS",
  },
  context: async ({ request }) => {
    // Get the session from the request
    const sessionId = (await request.cookieStore?.get("authjs.session-token"))
      ?.value;

    if (!sessionId) {
      return { db };
    }

    const sess = await db.query.sessions.findFirst({
      where: eq(sessions.sessionToken, sessionId),
      with: {
        user: { columns: { id: true, name: true, email: true, image: true } },
      },
    });

    // Extract user from session, or set to null if no session
    const user = sess!.user as User;

    return {
      db,
      user,
    };
  },
});
