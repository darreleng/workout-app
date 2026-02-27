import { Outlet } from "react-router";
import { Paper, Center } from "@mantine/core";
import { clamp } from "@mantine/hooks";

export default function AuthLayout() {
    return (
        <Center h="75vh">
            <Paper p="lg" w={{ base: '95vw', sm: 400 }} withBorder>
                <Outlet />
            </Paper>
        </Center>
    )
}