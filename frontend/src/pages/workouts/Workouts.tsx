import { Box, Button, Center, Title, ScrollArea, Text, Loader, Container, Stack, Group, Modal, TextInput } from "@mantine/core";
import { useDisclosure, useIntersection } from "@mantine/hooks";
import { useEffect, useRef } from "react";
import { IconPlus } from '@tabler/icons-react'
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
            const response = await fetch(`/api/workouts?cursor=${encodeURIComponent(pageParam)}`, { credentials: 'include' });
            const data = await response.json();
            if (!response.ok) throw data;
            return data;
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
            const res = await fetch('/api/workouts', { 
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
    });

    if (isPending) return <Center h={'100vh'}><Loader size='xl' /></Center>; 
    if (error) return ;

    function handleClose() {
        close()
        form.reset();
    }

    return (
        <Box className={classes.wrapper}>
            <Container size="sm" className={classes.responsiveContainer}>
                <Group justify="space-between" className={classes.titleGroup}>
                    <Title className={classes.title}>Workouts</Title>
                    <Button 
                        leftSection={<IconPlus stroke={2} size={20}/>} 
                        loading={mutation.isPending} 
                        onClick={open}
                        disabled={!!activeWorkout}
                    >
                        <Text hiddenFrom="sm" fw={800}>New</Text>
                        <Text visibleFrom="sm" fw={800}>New Workout</Text>
                    </Button>
                </Group>

                <ScrollArea 
                    viewportRef={containerRef} 
                    type="never" 
                >
                    <Stack className={classes.stackGap}>
                        {workouts.pages.map((page, i) => (
                        <Stack key={i} className={classes.stackGap}>
                            {page.itemsToReturn.map((workout: WorkoutProps) => (
                                <WorkoutCard key={workout.id} {...workout} />
                            ))}
                        </Stack>
                        ))}
                        
                        <Box ref={ref} pb={{ base: `${activeWorkout ? '72' : '42'}`, sm: `${activeWorkout ? '8' : '0'}`}}>
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
            <Modal opened={opened} onClose={handleClose} withCloseButton={false} yOffset={'20vh'} >
                <form onSubmit={form.onSubmit(values => mutation.mutate(values.name))}>
                    <TextInput
                        withAsterisk
                        label="Workout Name"
                        {...form.getInputProps('name')}
                    />
                    <Group justify="space-between" pt={'sm'}>
                        <Button variant="subtle" color="gray" onClick={handleClose}>Cancel</Button>
                        <Button type="submit" loading={mutation.isPending}>Create</Button>
                    </Group>
                </form>
            </Modal>
        </Box>
    )
}
