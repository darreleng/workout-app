import { useNavigate, Outlet } from "react-router";
import { authClient } from "./auth-client";
import { Center, Loader, Stack, Text } from "@mantine/core";

export default function PublicRoute() {
    const { data: session, isPending, error } = authClient.useSession();
    const navigate = useNavigate();

    if (isPending || error) {
        return (
            <Center h="100svh">
                <Stack align="center" gap="xs">
                    <Loader size="lg" />
                    <Text fw={500}>
                        {error ? "Waking up the server..." : "Checking session..."}
                    </Text>
                </Stack>
            </Center>
        );
    }

    if (session) navigate('/workouts', { replace: true });

    return (
        <Outlet />
    )
}

