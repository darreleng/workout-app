import { useNavigate, Outlet } from "react-router";
import { authClient } from "./auth-client";
import { Center, Loader } from "@mantine/core";

export default function PublicRoute() {
    const { data: session, isPending } = authClient.useSession();
    const navigate = useNavigate();

    if (isPending) {
        return (
            <Center h="100vh">
                <Loader color="blue" />
            </Center>
        );
    }

    if (session) navigate('/workouts', { replace: true });

    return (
        <Outlet />
    )
}

