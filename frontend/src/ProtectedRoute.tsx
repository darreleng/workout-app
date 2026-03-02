import { authClient } from "./auth-client";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Center, Loader, Stack, Text } from "@mantine/core";

export default function ProtectedRoute() {
    const { data: session, isPending, error } = authClient.useSession();
    const navigate = useNavigate();
    const location = useLocation();

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

    if (!session) navigate('/signin', { replace: true, state: { from: location } });

    return (
        <Outlet />
    )
};
