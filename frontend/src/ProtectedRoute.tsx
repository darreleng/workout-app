import { authClient } from "./auth-client";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Center, Loader } from "@mantine/core";

export default function ProtectedRoute() {
    const { data: session, isPending } = authClient.useSession();
    const navigate = useNavigate();
    const location = useLocation();

    if (isPending) {
        return (
            <Center h="100svh">
                <Loader />
            </Center>
        );
    }

    if (!session) navigate('/signin', { replace: true, state: { from: location } });

    return (
        <Outlet />
    )
};
