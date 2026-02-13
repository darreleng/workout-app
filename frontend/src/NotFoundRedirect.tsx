import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Center, Stack, Title, Text, Button } from '@mantine/core';

//TODO: touch up

export function NotFoundRedirect() {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        const redirect = setTimeout(() => {
            navigate('/workouts', { replace: true });
        }, 5000);

        return () => {
            clearInterval(timer);
            clearTimeout(redirect);
        };
    }, [navigate]);

    return (
        <Center h="80vh">
            <Stack align="center">
                <Title order={2}>404</Title>
                <Text c="dimmed">
                    It looks like this workout does not exist or does not belong to you. 
                    Redirecting to your list of workouts in {countdown}s...
                </Text>
                <Button variant="light" onClick={() => navigate('/workouts')}>
                    Go Back Now
                </Button>
            </Stack>
        </Center>
    );
}