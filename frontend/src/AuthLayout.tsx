import { Outlet } from "react-router";
import { Paper, Center } from "@mantine/core";

export default function AuthLayout() {
    return (
        <Center h="75vh">
            <Paper radius="md" p="lg" miw="300" withBorder>
                <Outlet />
            </Paper>
        </Center>
    )
}