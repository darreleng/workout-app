import { betterAuth } from 'better-auth';
import { pool } from './db/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    database: pool,
    trustedOrigins: [
        "http://localhost:5173",
        process.env.CLIENT_URL as string
    ],
    emailAndPassword: { 
        enabled: true, 
        sendResetPassword: async ({ user, url, token }, request) => {
            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: user.email,
                subject: 'Reset your password',
                html: `Click the link to reset your password: ${url}`
            });
        }
    },
    socialProviders: { 
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    }
});

