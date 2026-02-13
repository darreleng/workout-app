import { Center, Box, Button, Loader, TextInput, Group, Stack } from "@mantine/core";
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
            await queryClient.invalidateQueries({ queryKey: ['workouts'], exact: true, refetchType: 'all' });
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
        <Center>
            <Box p={24} bg={'#dee2e6'} miw={700}>
                <Group justify="space-between">
                    <WorkoutNameInput workoutName={workout.name} id={workout.id} />
                    <IconStopwatch stroke={2} />
                </Group>

            {workout.exercises.map((exercise: ExerciseCardProps) => (
                <ExerciseCard key={exercise.id} {...exercise} />
            )
            
            )} 
                <Stack>
                    <AddExerciseButton workoutId={id!} />
                    <Group grow={true} >
                        <Button color="red" onClick={() => mutation.mutate(id!)}>Discard workout</Button>
                        <Button color="green" component={Link} to='/workouts' >Save workout</Button>
                    </Group>
                </Stack>
                <TextInput label='NOTES'></TextInput>
            </Box>

        </Center>
    )
}