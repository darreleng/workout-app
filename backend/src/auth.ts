import { betterAuth } from 'better-auth';
import { pool } from './db/db';

export const auth = betterAuth({
    database: pool,
    trustedOrigins: [
        "http://localhost:5173"
    ],
    emailAndPassword: { 
        enabled: true, 
    }, 
    socialProviders: { 
        github: { 
        clientId: process.env.GITHUB_CLIENT_ID as string, 
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        }, 
    }
});