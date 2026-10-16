import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, anonymous } from "better-auth/plugins";
import { db } from "../db/client";
import * as schema from "../db/schema"; 
import { sendEmail } from "./emails/email";
import { eq } from "drizzle-orm";
import { links } from "../db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  emailAndPassword: { enabled: true },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
        html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:5173"], 
  plugins: [
    openAPI(),
    anonymous({
      onLinkAccount: async ({
        anonymousUser,
        newUser,
      }: {
        anonymousUser: any;
        newUser: any;
      }) => {
        await db
          .update(links)
          .set({ user_id: newUser.user.id })
          .where(eq(links.user_id, anonymousUser.user.id));
      },
    }),
  ],
});
