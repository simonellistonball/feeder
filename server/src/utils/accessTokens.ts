import { YogaInitialContext } from "graphql-yoga";
import { logger } from "../logger";
import { GraphQLContext } from "../schema";
import { db } from "../db";
import * as db_schema from "../db/schema";
import { eq } from "drizzle-orm";

const { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET } = process.env;
if (!AUTH_GOOGLE_ID || !AUTH_GOOGLE_SECRET) {
  throw new Error("AUTH_GOOGLE_ID or AUTH_GOOGLE_SECRET is not defined");
}

export const accessTokenQuery = async (
  _,
  _args,
  context: GraphQLContext & YogaInitialContext
) => {
  logger.info("accessTokens", _args, context);
  // get the access tokens for the current user (by jwt or session) from the database
  if (context.jwt) {
    const { _id } = context.jwt.payload;
    const tokens = await db.query.accounts.findFirst({
      where: eq(db_schema.accounts.userId, _id),
      columns: {
        access_token: true,
        refresh_token: true,
        expires_at: true,
      },
    });
    if (!tokens) {
      throw new Error("No tokens found");
    }
    if ((tokens.expires_at ?? 0) < Date.now() / 1000) {
      const refresh_token = tokens.refresh_token;
      if (!refresh_token) {
        throw new Error("No refresh token found");
      }

      // refresh the tokens
      logger.info(
        `refreshing tokens for ${_id} which expired at ${new Date((tokens.expires_at ?? 0) * 1000)}`
      );

      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        body: new URLSearchParams({
          client_id: AUTH_GOOGLE_ID!,
          client_secret: AUTH_GOOGLE_SECRET!,
          grant_type: "refresh_token",
          refresh_token: refresh_token!,
        }),
      });

      const tokensOrError = await response.json();
      if (!response.ok) throw tokensOrError;

      const newTokens = tokensOrError as {
        access_token: string;
        expires_in: number;
        refresh_token?: string;
      };

      const res = {
        access_token: newTokens.access_token,
        expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
        // Some providers only issue refresh tokens once, so preserve if we did not get a new one
        refresh_token: newTokens.refresh_token
          ? newTokens.refresh_token
          : refresh_token,
      };

      // update the database with the new tokens
      await db
        .update(db_schema.accounts)
        .set({
          access_token: res.access_token,
          refresh_token: res.refresh_token,
          expires_at: res.expires_at,
        })
        .where(eq(db_schema.accounts.userId, _id));

      console.log(`tokens expired and renewed`);
      return res;
    }
    return tokens;
  }

  return { accessToken: "", refreshToken: "", expiresAt: 0 };
};

export const accessTokenMutation = async (
  _,
  args: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  },
  context: GraphQLContext & YogaInitialContext
) => {
  const { user, jwt } = context;
  if (!(user || jwt)) {
    throw new Error("Unauthorized");
  }
  const userId = (user?.id || jwt?.payload._id) ?? "";
  logger.info(`accessTokens for ${userId}`);

  const { access_token, refresh_token, expires_at } = args;
  const result = await db
    .update(db_schema.accounts)
    .set({
      access_token,
      refresh_token,
      expires_at,
    })
    .where(eq(db_schema.accounts.userId, userId))
    .returning({
      access_token: db_schema.accounts.access_token,
      refresh_token: db_schema.accounts.refresh_token,
      expires_at: db_schema.accounts.expires_at,
    });
  return result[0];
};
