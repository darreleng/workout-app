import { Box, Button, Center, Title, ScrollArea, Text, Loader, Container, Stack, Group, Modal, TextInput, Divider } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useDisclosure, useIntersection } from "@mantine/hooks";
import { useEffect, useRef } from "react";
import { IconPlus, IconX } from '@tabler/icons-react'
import { useInfiniteQuery, useMutation,  useQueryClient } from '@tanstack/react-query';
import WorkoutCard from "./WorkoutCard";
import { useNavigate, useOutletContext } from "react-router";
import { WorkoutNameSchema, type WorkoutProps } from "../../../../shared/schemas";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import classes from './Workouts.module.css';

export default function Workouts() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { ref, entry } = useIntersection({ root: containerRef.current });
    const [opened, { open, close }] = useDisclosure(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const activeWorkout = useOutletContext();
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            name: '',
        },
        validate: zod4Resolver(WorkoutNameSchema)
    });

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


    const mutation = useMutation({
        mutationFn: async (workoutName: string) => {
            const res = await fetch('http://localhost:3000/api/workouts', { 
                method: 'POST', 
                credentials: 'include',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ workoutName })
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

    function handleClose() {
        close()
        form.reset();
    }

    return (
        <Box className={classes.wrapper}>
            <Container size="sm" className={classes.responsiveContainer}>
                <Group justify="space-between" mb='sm' className={classes.titleGroup}>
                    <Title className={classes.title}>Workouts</Title>
                    <Button 
                        leftSection={<IconPlus stroke={2} size={20}/>} 
                        loading={mutation.isPending} 
                        onClick={open}
                        radius="md"
                        size="sm"
                        variant="filled"
                        disabled={!!activeWorkout}
                    >
                        <Text hiddenFrom="sm">New</Text>
                        <Text visibleFrom="sm">New Workout</Text>
                    </Button>
                </Group>

                <Divider mr={'-md'} ml={'-md'}/>

                <ScrollArea 
                    viewportRef={containerRef} 
                    type="never" 
                    h={{ base: `${activeWorkout ? '77vh' : '100vh'}`, sm: `${activeWorkout ? '83vh' : '86vh'}` }}
                    scrollbarSize={2}
                >
                    <Stack gap="lg">
                        {workouts.pages.map((page, i) => (
                        <Stack key={i} gap="lg">
                            {page.itemsToReturn.map((workout: WorkoutProps) => (
                                <WorkoutCard key={workout.id} {...workout} />
                            ))}
                        </Stack>
                        ))}
                        
                        <Box ref={ref} className={classes.endBox}>
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
            <Modal opened={opened} onClose={handleClose} withCloseButton={false} radius="md" centered>
                <form onSubmit={form.onSubmit(values => mutation.mutate(values.name))}>
                    <TextInput
                        withAsterisk
                        label="New workout name"
                        {...form.getInputProps('name')}
                    />
                    <Group justify="space-between" pt={'sm'}>
                        <Button variant="subtle" onClick={handleClose}>Cancel</Button>
                        <Button type="submit" loading={mutation.isPending}>Create</Button>
                    </Group>
                </form>
            </Modal>
        </Box>
    )
}
