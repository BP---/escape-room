import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./server/db";
import { env } from "$env/dynamic/private";
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite", // or "mysql", "sqlite"
    }),
    socialProviders: {
        github: { 
            clientId: env.GITHUB_CLIENT_ID as string, 
            clientSecret: env.GITHUB_CLIENT_SECRET as string, 
        }, 
        google: { 
            clientId: env.GOOGLE_CLIENT_ID as string, 
            clientSecret: env.GOOGLE_CLIENT_SECRET as string, 
        },
    },
    user: {
        additionalFields: {
            premium: {
                type: "boolean",
                required: false,
                defaultValue: false,
            },
        },
    },
});