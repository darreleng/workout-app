import { Box, Button, Center, Title, ScrollArea, Text, Loader, Container, Stack, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useIntersection } from "@mantine/hooks";
import { useEffect, useRef } from "react";
import { IconPlus, IconX } from '@tabler/icons-react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import WorkoutCard from "./WorkoutCard";
import { useNavigate } from "react-router";
import type { WorkoutProps } from "../../../../shared/schemas";

export default function Workouts() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { ref, entry } = useIntersection({
        root: containerRef.current
    })

    const {
        data: workouts,
        fetchNextPage,    
        hasNextPage,
        isFetchingNextPage,
        error,
        isPending
    } = useInfiniteQuery({
        queryKey: ['workouts'],
        queryFn: async ({ pageParam }) => {
            const response = await fetch(`http://localhost:3000/api/workouts?cursor=${encodeURIComponent(pageParam)}`, { credentials: 'include' });
            if (!response.ok) throw await response.json();
            return response.json();
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    useEffect(() => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [entry, fetchNextPage, hasNextPage, isFetchingNextPage]);

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('http://localhost:3000/api/workouts', { 
                method: 'POST', 
                credentials: 'include',
            });

            if (!res.ok) throw await res.json();
            return res.json();
        },
        onSuccess: (newWorkout) => {
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
            navigate(`/workouts/${newWorkout.id}`);
        },
        onError: (error) => {
            notifications.show({
                title: 'Failed to start a new workout',
                message: error.message,
                color: 'red',
                autoClose: 2000,
                icon: <IconX stroke={2} size={20} />,            
            });
        }
    });

    if (isPending) return <div><Loader size='sm' /></div>; 
    if (error) return <div>Error: {error.message}</div>;

    return (
        <Box bg="var(--mantine-color-gray-0)" mih="100vh">
            <Container size="sm" py="xl">
                <Stack gap="md" mb="xl">
                    <Group justify="space-between" align="flex-end">
                        <Title order={1} fw={900} lts="-0.5px">Workouts</Title>
                        
                        <Button 
                            leftSection={<IconPlus stroke={2} size={20}/>} 
                            loading={mutation.isPending} 
                            onClick={() => mutation.mutate()}
                            radius="md"
                            size="md"
                            variant="filled"
                        >
                            New Workout
                        </Button>
                    </Group>
                </Stack>

                <ScrollArea 
                    viewportRef={containerRef} 
                    type="hover" 
                    h="calc(100vh - 250px)"
                    offsetScrollbars
                >
                    <Stack gap="lg">
                        {workouts.pages.map((page, i) => (
                        <Stack key={i} gap="lg">
                            {page.itemsToReturn.map((workout: WorkoutProps) => (
                            <WorkoutCard key={workout.id} {...workout} />
                            ))}
                        </Stack>
                        ))}
                        
                        <Box ref={ref} py="xl">
                            {isFetchingNextPage ? (
                                <Center><Loader size="sm" variant="dots" /></Center>
                            ) : (
                                <Text ta="center" size="xs" c="dimmed" tt="uppercase" lts="1px">
                                {hasNextPage ? 'Loading more...' : 'End of your journey'}
                                </Text>
                            )}
                        </Box>
                    </Stack>
                </ScrollArea>
            </Container>
        </Box>
    )
}
