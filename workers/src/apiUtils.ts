import type { GaxiosResponse } from "gaxios";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { google } from "googleapis";
import { logger } from "./logger";
import { trace } from "@opentelemetry/api";

const { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET } = process.env;
if (!AUTH_GOOGLE_ID || !AUTH_GOOGLE_SECRET) {
  throw new Error("Missing Google OAuth credentials");
}

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET_KEY) {
  throw new Error("JWT_SECRET_KEY is not defined");
}

const tracer = trace.getTracer("feedrouter-workers");

export function checkRates<T>(response: GaxiosResponse<T>) {
  if (
    response.status == 429 ||
    // TODO fix this up next time we see one
    response.status == 403
  ) {
    logger.warn("Google api rate limit hit");
    logger.info(JSON.stringify(response.data));
    // figure out a retry period
    if (response.headers["retry-after"]) {
      // figure out if the retry header is just a number or a date
      const retryAfter = (
        isNaN(parseInt(response.headers["retry-after"]))
          ? () => {
              const retryDate = new Date(response.headers["retry-after"]);
              return retryDate.getTime() - new Date().getTime();
            }
          : () => parseInt(response.headers["retry-after"])
      )();
      throw new RateLimitErrorWithTime(retryAfter);
    } else {
      // no header, just retry in a bit with some jitter
      throw new RateLimitErrorWithTime(1000 + Math.random() * 1000);
    }
  }

  if (response.status >= 400) {
    logger.error(
      `Google API returned ${response.status} ${response.statusText}`
    );
  }
}

const TOKEN_API = process.env.TOKEN_API;
if (!TOKEN_API) {
  throw new Error("Missing TOKEN_API enviorment variable");
}

const tokenCache: Map<
  string,
  {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    timestamp: number;
  }
> = new Map();

// Cache duration in milliseconds (e.g., 5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

interface AccessTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export async function getAccessToken(userId: string): Promise<AccessTokens> {
  return tracer.startActiveSpan("getAccessToken", (span) => {
    span.setAttribute("userId", userId);

    if (!userId) {
      logger.error("Missing userId");
      throw new Error("Missing userId");
    }
    const cached = tokenCache.get(userId);
    const now = Date.now();
    // Return cached value if it exists and isn't expired
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      span.setAttribute("cache", "hit");
      span.end();
      return Promise.resolve(cached as AccessTokens);
    }
    span.setAttribute("cache", "miss");
    span.addEvent("fetching access token");

    logger.info(`getting access token for ${userId}`);
    // construct a jwt token to authenticate with the token api
    const jwtToken = jwt.sign(
      {
        _id: userId,
      },
      JWT_SECRET_KEY!,
      {
        expiresIn: "1 minute",
        issuer: "https://feeder.simonellistonball.com",
        audience: "api",
      }
    );

    // get the access token and refresh token from an api using the ACCESS_API enviorment variable as a URL and the userId as a parameter
    const fetchResult = fetch(TOKEN_API!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        query:
          "query AccessQuery{accessTokens{access_token expires_at refresh_token}}",
        operationName: "AccessQuery",
        extensions: {},
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        const data = res.data as { accessTokens: AccessTokens };
        return data.accessTokens as AccessTokens;
      })
      .then((data) => {
        tokenCache.set(userId, {
          ...data,
          timestamp: now,
        });
        return data;
      })
      .catch((err) => {
        logger.error("error getting access token", err);
        throw err;
      });

    span.end();
    return fetchResult;
  });
}

export async function getGoogleAuth(userId: string) {
  const span = tracer.startSpan("getGoogleAuth");
  const oauth2Client = await getAccessToken(userId).then(
    ({ access_token, refresh_token, expires_at }) => {
      const oauth2Client = new OAuth2Client({
        clientId: AUTH_GOOGLE_ID,
        clientSecret: AUTH_GOOGLE_SECRET,
      });

      // Set credentials
      oauth2Client.setCredentials({
        access_token,
        refresh_token,
        expiry_date: expires_at,
      });
      return oauth2Client;
    }
  );
  span.end();
  return oauth2Client;
}

export async function getGmail(userId: string) {
  const oauth2Client = await getGoogleAuth(userId);
  return google.gmail({ version: "v1", auth: oauth2Client });
}
export class RateLimitErrorWithTime extends Error {
  retryAfter: number;

  constructor(retryAfter: number) {
    super(`Rate limit exceeded. Retry after ${retryAfter} ms.`);
    this.retryAfter = retryAfter;
    this.name = "RateLimitErrorWithTime";
  }
}
