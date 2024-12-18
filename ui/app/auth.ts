import NextAuth from "next-auth";
import { type NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [
    // Add your preferred providers here
    // For example, to add GitHub authentication:
    // GitHub({
    //   clientId: process.env.GITHUB_ID,
    //   clientSecret: process.env.GITHUB_SECRET,
    // }),
  ],
  callbacks: {
    authorized({ request, auth }) {
      return !!auth?.user;
    },
  },
};

export const { auth, signIn, signOut } = NextAuth(authConfig);
