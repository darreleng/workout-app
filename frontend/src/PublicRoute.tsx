import { useNavigate, Outlet } from "react-router";
import { authClient } from "./auth-client";
import { Center, Loader, Stack, Text } from "@mantine/core";
import { useEffect } from "react";

export default function PublicRoute() {
    const { data: session, isPending, error, refetch } = authClient.useSession();
    const navigate = useNavigate();

    useEffect(() => {
        let interval: any;
        if (error) {
            interval = setInterval(() => {
                refetch();
            }, 5000);
        }

        return () => clearInterval(interval);
    }, [error, refetch]);

        useEffect(() => {
        if (!isPending && !session) {
            navigate('/signin');
        }
    }, [session, isPending, navigate]);

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

    return (
        <Outlet />
    )
}

