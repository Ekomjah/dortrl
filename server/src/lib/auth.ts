import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { db } from "../db/client";
import * as schema from "../db/schema"; // must export user, session, account, verification

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true },
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
  trustedOrigins: ["http://localhost:5173"], // your frontend origin
  plugins: [openAPI()], // dev-only API explorer
});

// export const auth = betterAuth({
//   database: drizzleAdapter(db, {
//     provider: "sqlite",
//   }),
// });
