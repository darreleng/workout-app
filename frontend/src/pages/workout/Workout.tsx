import { Text, Box, Button, Loader, TextInput, Group, Stack, Container, Paper, Divider } from "@mantine/core";
import { IconStopwatch } from '@tabler/icons-react';
import type { ExerciseCardProps, WorkoutWithExercisesAndSets } from "../../../../shared/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router";
import ExerciseCard from "./ExerciseCard";
import AddExerciseButton from "./AddExerciseButton";
import WorkoutNameInput from "./WorkoutNameInput";
import { NotFoundRedirect } from "../../NotFoundRedirect";

export default function Workout(){
    const { id } = useParams();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: workout, error, isLoading } = useQuery<WorkoutWithExercisesAndSets>({
        queryKey: ['workouts', id],
        queryFn: async () => {
            const res = await fetch(`http://localhost:3000/api/workouts/${id}`, {credentials: 'include'});
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
    });

    const mutation = useMutation({
        mutationFn: async (workoutId: string) => {
            const res = await fetch(`http://localhost:3000/api/workouts/${workoutId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['workouts'], exact: true });
            navigate(`/workouts`, { replace: true });
        },
        // TODO: Think of error notifcation
        onError: (error) => {
            console.log(error);
        }
    })

    // TODO: SKELETON
    if (isLoading) {
        return <Loader color="blue" />;
    }

    if (error || !workout) {
        return <NotFoundRedirect />;
    }

    return (
        <Box bg="var(--mantine-color-gray-0)" mih="100vh" pb={100}>
            <Container size="sm" py="md">
                <Stack gap="lg">
                
                {/* Header Area */}
                <Paper p="md" radius="md" withBorder shadow="xs">
                    <Group justify="space-between" align="center">
                    <WorkoutNameInput workoutName={workout.name} id={workout.id} />
                    <Group gap="xs" c="blue.6">
                        <IconStopwatch size={20} />
                        <Text fw={700}>45:02</Text> {/* TODO: Fix */}
                    </Group>
                    </Group>
                </Paper>

                <Stack gap="md">
                    {workout.exercises.map((exercise) => (
                    <ExerciseCard key={exercise.id} {...exercise} />
                    ))}
                </Stack>

                <Paper p="md" radius="md" withBorder>
                    <Stack gap="md">
                    <AddExerciseButton workoutId={id!} />
                    <TextInput 
                        label="Workout Notes" 
                        placeholder="How did it feel?" 
                        variant="filled"
                    />
                    <Divider my="sm" label="Finish Session" labelPosition="center" />
                    <Group grow>
                        <Button variant="light" color="red" onClick={() => mutation.mutate(id!)}>
                        Discard
                        </Button>
                        <Button color="green" component={Link} to='/workouts' size="md">
                        Save Workout
                        </Button>
                    </Group>
                    </Stack>
                </Paper>
                
                </Stack>
            </Container>
        </Box>
    )
}