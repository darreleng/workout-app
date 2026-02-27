import { Navigate } from "react-router";
import { authClient } from "../../auth-client";
import { Center, Loader } from "@mantine/core";

export default function Home() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) return <Center h={'100vh'}><Loader size='xl' /></Center>; 

    if (session) return <Navigate to="/workouts" replace />;

    return <Navigate to="/signin" replace />;
};