import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: import.meta.env.BETTER_AUTH_URL,
    retry: {
        attempts: 3,
        delay: 1500
    }
})