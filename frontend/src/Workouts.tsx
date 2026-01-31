import { Box, Button, Center, Title, ScrollArea, Text, Loader } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import { useEffect, useRef } from "react";
import { IconPlus } from '@tabler/icons-react'
import { useInfiniteQuery } from '@tanstack/react-query';
import WorkoutCardClosed from "./WorkoutCardClosed";

interface Workout {
  id: string;
  name: string;
  created_at: string;
}

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

    if (isPending) return <div>Loading workouts...</div>;
    if (error) return <div>Error: {error.message}</div>;
    console.log(workouts)

    return (
        <Center>
            <Box p={24} bg={'#dee2e6'} miw={700}>
                <Title order={1}>Workouts</Title>
                <Button leftSection={<IconPlus stroke={2} size={20}/>} fullWidth>Start a new workout</Button>
                {/* TODO: adjust the height and sizes of cards */}
                <ScrollArea viewportRef={containerRef} type="never" h={500}>
                    {workouts.pages.map((page, i) => (
                        <div key={i}>
                            {page.itemsToReturn.map((workout: Workout) => (
                                <WorkoutCardClosed 
                                    key={workout.id}
                                    name={workout.name} 
                                    created_at={new Date(workout.created_at)}
                                />
                            ))}
                        </div>
                    ))}
                    <div ref={ref} style={{ height: 20 }}>
                        {isFetchingNextPage ? (
                            <Center p="xs"><Loader size="sm" /></Center>
                        ) : hasNextPage ? (
                            <Text ta="center" size="sm" c="dimmed">Scroll for more</Text>
                        ) : (
                            <Text ta="center" size="sm" c="dimmed">Nothing more to load</Text>
                        )}
                    </div>
                </ScrollArea>
            </Box>
        </Center>
    )
}
