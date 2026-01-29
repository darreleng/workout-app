import { authClient } from "./auth-client"

export default function WorkoutList() {

    const { data } = authClient.useSession();

    return (
        `HELLO ${data!.user.name}`
    )
}