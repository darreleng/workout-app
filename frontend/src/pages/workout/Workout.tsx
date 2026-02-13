import { Center, Box, Button, Loader, TextInput, Group, Stack } from "@mantine/core";
import { IconStopwatch } from '@tabler/icons-react';
import type { ExerciseCardProps, WorkoutWithExercisesAndSets } from "../../../../shared/schemas";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import ExerciseCard from "./ExerciseCard";
import AddExerciseButton from "./AddExerciseButton";
import WorkoutNameInput from "./WorkoutNameInput";


export default function Workout(){
    const { id } = useParams();
    const { data: workout, error, isLoading } = useQuery<WorkoutWithExercisesAndSets>({
        queryKey: ['workouts', id],
        queryFn: async () => {
            const res = await fetch(`http://localhost:3000/api/workouts/${id}`, {credentials: 'include'});
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
    });

    // TODO: SKELETON
    if (isLoading) {
        return <Loader color="blue" />;
    }

    if (error || !workout) {
        return error?.message;
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
                        <Button color="red">Discard workout</Button>
                        <Button color="green">Save workout</Button>
                    </Group>
                </Stack>
                <TextInput label='NOTES'></TextInput>
            </Box>


        </Center>
    )
}