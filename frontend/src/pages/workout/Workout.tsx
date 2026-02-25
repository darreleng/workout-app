import { Text, Box, Button, Loader, TextInput, Group, Stack, Container, Paper, Divider, SimpleGrid, Modal } from "@mantine/core";
import { IconStopwatch } from '@tabler/icons-react';
import type { WorkoutWithExercisesAndSets } from "../../../../shared/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router";
import ExerciseCard from "./ExerciseCard";
import AddExerciseButton from "./AddExerciseButton";
import WorkoutNameInput from "./WorkoutNameInput";
import { NotFoundRedirect } from "../../NotFoundRedirect";
import { useWorkoutTimer } from "../../useWorkoutTimer";
import { formatDuration } from "../../formatDuration";
import { useDisclosure, useWindowScroll } from "@mantine/hooks";
import classes from './Workout.module.css';
import { useEffect, useState } from "react";

export default function Workout(){
    const { id } = useParams();
    const [isFinishModalOpen, finishModal] = useDisclosure(false);
    const [isDiscardModalOpen, discardModal] = useDisclosure(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [scroll] = useWindowScroll();
    const [hidden, setHidden] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        if (scroll.y > lastScrollY && scroll.y > 50) setHidden(true);
        else setHidden(false);
        setLastScrollY(scroll.y);
    }, [scroll.y]);

    const { data: workout, error, isLoading } = useQuery<WorkoutWithExercisesAndSets>({
        queryKey: ['workouts', id],
        queryFn: async () => {
            const res = await fetch(`http://localhost:3000/api/workouts/${id}`, {credentials: 'include'});
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
    });

    const discardWorkout = useMutation({
        mutationFn: async (workoutId: string) => {
            const res = await fetch(`http://localhost:3000/api/workouts/${workoutId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw await res.json();
        },
        onSuccess: async () => {
            queryClient.removeQueries({ queryKey: ['activeWorkout'] });
            queryClient.invalidateQueries({ queryKey: ['exercises']});
            queryClient.invalidateQueries({ queryKey: ['workouts'], exact: true });
            navigate(`/workouts`, { replace: true });
        },
        // TODO: Think of error notifcation
        onError: (error) => {
            console.log(error);
        }
    })

    const updateNotes = useMutation({
        mutationFn: async (notes: string) => {
            const res = await fetch(`http://localhost:3000/api/workouts/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ notes })
            });
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
        }
    });

    const completeWorkout = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`http://localhost:3000/api/workouts/${id}`, {
                method: 'PATCH',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to complete workout');
            return res.json();
        },
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['activeWorkout'] });
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            navigate('/workouts');
        }
    });
    
    const activeStartTime = workout?.completed_at ? null : workout?.created_at;
    const elapsedSeconds = useWorkoutTimer(activeStartTime);
    
    // TODO: SKELETON
    if (isLoading) {
        return <Loader color="blue" />;
    }

    if (error || !workout) {
        return <NotFoundRedirect />;
    }

    return (
        <Box bg="var(--mantine-color-gray-0)" mih="100vh">
            <Container size="sm" py="md">
                <Stack gap="sm">
                    <Paper p="sm" radius="md" withBorder shadow="xs" className={hidden ? classes.headerHidden : classes.header}>
                        <Group justify="space-between" align="center" >
                            <WorkoutNameInput workoutName={workout.name} id={workout.id} />
                            <Group gap="xs" c="blue.6">
                                <IconStopwatch size={20} />
                                <Text fw={700} ff="monospace">
                                    {workout.completed_at 
                                    ? formatDuration(workout.duration_seconds) 
                                    : formatDuration(elapsedSeconds)}
                                </Text>
                            </Group>
                        </Group>
                    </Paper>

                    <Stack gap="sm">
                        {workout.exercises.map((exercise) => (
                            <ExerciseCard key={exercise.id} {...exercise} />
                        ))}
                    </Stack>

                    <Paper p="md" radius="md" withBorder>
                        <Stack gap="md">
                            <AddExerciseButton workoutId={workout.id} />
                            <TextInput 
                                label="Workout Notes" 
                                placeholder="Thoughts?" 
                                variant="filled"
                                defaultValue={workout.notes}
                                onBlur={(e) => {
                                    const newValue = e.target.value.trim();
                                    if (newValue !== workout.notes) updateNotes.mutate(newValue);
                                }}
                            />
                            <Divider my="xs" />
                            <Group grow>
                                <Button variant="light" color="red" onClick={discardModal.open}>
                                    Discard
                                </Button>
                                {workout.completed_at 
                                    ? <Button color="green" component={Link} to='/workouts' size="md">
                                        Save & Exit
                                    </Button> 
                                    : <Button onClick={finishModal.open}>Finish</Button>
                                }
                            </Group>
                        </Stack>
                    </Paper>
                </Stack>
            </Container>

            <Modal 
                opened={isFinishModalOpen} 
                onClose={finishModal.close} 
                withCloseButton={false}
                centered
                radius="md"
                >
                <Stack gap="md">
                    <Text size="sm" c="dimmed">
                    Are you sure you want to end this workout?
                    </Text>

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                        <Button variant="light" color="gray" onClick={finishModal.close} size="md" radius="md">
                            Cancel
                        </Button>
                        
                        <Button color="green" onClick={() => completeWorkout.mutate(workout.id)} size="md" radius="md">
                            Finish and Save
                        </Button>
                    </SimpleGrid>
                </Stack>
            </Modal>

            <Modal 
                opened={isDiscardModalOpen} 
                onClose={discardModal.close} 
                withCloseButton={false}
                centered
                radius="md"
                >
                <Stack gap="md">
                    <Text size="sm" c="dimmed">
                    Are you sure you want to discard this workout?
                    </Text>

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                        <Button variant="light" color="gray" onClick={discardModal.close} size="md" radius="md">
                            Cancel
                        </Button>
                        
                        <Button color="red" onClick={() => discardWorkout.mutate(workout.id)} size="md" radius="md">
                            Discard
                        </Button>
                    </SimpleGrid>
                </Stack>
            </Modal>
            
        </Box>
    )
}