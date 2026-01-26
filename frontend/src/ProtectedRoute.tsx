import { authClient } from "./auth-client";
import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Center, Loader } from "@mantine/core";

export default function ProtectedRoute() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isPending && !session) {
      navigate("/login", { 
        replace: true, 
        state: { from: location } 
      });
    }
  }, [isPending, session, navigate, location]);

  if (isPending) {
    return (
      <Center h="100vh">
        <Loader color="blue" />
      </Center>
    );
  }
  
  return session ? <Outlet /> : null;
};
