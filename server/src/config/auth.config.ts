import GitHub from "@auth/express/providers/github";
import Google from "@auth/express/providers/google";

import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, sessions, users, verificationTokens } from "../db/schema";
import { db } from "../db";
import { logger } from "../logger";
import { ExpressAuthConfig } from "@auth/express";
import { and, eq } from "drizzle-orm";

export const authConfig = {
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: "database" as "jwt" | "database",
  },
  callbacks: {
    session: async ({ session, user }) => {
      const googleAccount = await db.query.accounts.findFirst({
        where: (account, { eq }) => eq(account.userId, user.id),
      });
      console.log(new Date(googleAccount!.expires_at! * 1000));
      if (googleAccount!.expires_at! * 1000 < Date.now()) {
        // If the access token has expired, try to refresh it
        try {
          // https://accounts.google.com/.well-known/openid-configuration
          // We need the `token_endpoint`.
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            body: new URLSearchParams({
              client_id: process.env.AUTH_GOOGLE_ID! || "",
              client_secret: process.env.AUTH_GOOGLE_SECRET! || "",
              grant_type: "refresh_token",
              refresh_token: googleAccount!.refresh_token || "",
            }),
          });

          const tokensOrError = await response.json();

          if (!response.ok) throw tokensOrError;

          const newTokens = tokensOrError as {
            access_token: string;
            expires_in: number;
            refresh_token?: string;
          };

          await db
            .update(accounts)
            .set({
              access_token: newTokens.access_token,
              expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
              refresh_token:
                newTokens.refresh_token ?? googleAccount!.refresh_token,
            })
            .where(
              and(
                eq(accounts.provider, "google"),
                eq(accounts.providerAccountId, googleAccount!.providerAccountId)
              )
            );
        } catch (error) {
          logger.error("Error refreshing access_token", error);
          // If we fail to refresh the token, return an error so we can handle it on the page
          //session.error = "RefreshTokenError";
        }
      }
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      };
    },
    signIn: async ({ account, profile }) => {
      if (account?.provider === "google") {
        return (
          (profile?.email_verified ?? false) &&
          (profile?.email?.endsWith("@simonellistonball.com") ?? false)
        );
      }
      return true; // Do different verification for other providers that don't have `email_verified`
    },
  },
  logger: {
    error(code) {
      logger.error(code.message);
    },
    warn(code) {
      logger.warn(code);
    },
    debug(code, metadata) {
      logger.debug(code, metadata);
    },
  },
  providers: [
    GitHub,
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/drive.readonly",
            "https://www.googleapis.com/auth/drive.metadata.readonly",
            "https://mail.google.com/",
            "https://www.googleapis.com/auth/gmail.compose",
            "https://www.googleapis.com/auth/gmail.metadata",
            "https://www.googleapis.com/auth/gmail.modify",
            "https://www.googleapis.com/auth/gmail.readonly",
          ].join(" "),
        },
      },
    }),
  ],
} satisfies ExpressAuthConfig;
