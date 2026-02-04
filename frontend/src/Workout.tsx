import { Center, Box, Button, Loader, TextInput, Group, Stack } from "@mantine/core";
import { IconStopwatch, IconPlus } from '@tabler/icons-react';
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { WorkoutSchema } from "../../shared/schemas";
import type { ExerciseType } from "../../shared/schemas";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import ExerciseCard from "./ExerciseCard";
import AddExerciseButton from "./AddExerciseButton";

export default function Workout(){
    const form = useForm({
        initialValues: { workoutName: '' },
        validateInputOnBlur: true,
        validate: zod4Resolver(WorkoutSchema)
    });

    const { id } = useParams();
    const { data: workout, error } = useQuery({
        queryKey: ['workout', id],
        queryFn: async () => {
            const res = await fetch(`http://localhost:3000/api/workouts/${id}`, {credentials: 'include'});
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
    });

    console.log(`Workout data: ${workout}`);
    return (
        <Center>
            <Box p={24} bg={'#dee2e6'} miw={700}>
                <Group>
                    <TextInput placeholder="Workout name" />
                    <TextInput {...form.getInputProps('workoutName')} />
                    <IconStopwatch stroke={2} />
                </Group>
            {error && error.message}

            {workout?.map((exercise: ExerciseType) => (
                <ExerciseCard key={exercise.id} {...exercise}  />
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