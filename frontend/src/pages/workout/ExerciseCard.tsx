import { Box, Group, Paper, Stack, TextInput, Text } from "@mantine/core";
import { ExerciseNameSchema, type ExerciseCardProps } from "../../../../shared/schemas";
import AddSetButton from "./AddSetButton";
import SetCard from "./SetCard";
import DeleteExerciseButton from "./DeleteExerciseButton";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

export default function ExerciseCard(props: ExerciseCardProps) {
    const queryClient = useQueryClient();
    const [localName, setLocalName] = useState(props.name);
    const [error, setError] = useState(false);

    const mutation = useMutation({
        mutationFn: async (name: string) => {
            const res = await fetch(`http://localhost:3000/api/workouts/${props.workout_id}/exercises/${props.id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exerciseHistory'] });
        },
        // TODO: REMOVE OR REWORK ERROR NOTIFICATIONS
        onError: (error) => {
            notifications.show({
                title: 'Failed to modify exercise name',
                message: error.message,
                color: 'red',
                autoClose: 2000,
            });
        }
    });
    
    return (
        <Paper withBorder radius="md" shadow="sm">
            <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }} bg="var(--mantine-color-gray-0)">
                <Group justify="space-between">
                <TextInput 
                    variant="unstyled"
                    styles={{ input: { fontWeight: 600, fontSize: '1.1rem' }}}
                    value={localName}
                    onChange={(e) => setLocalName(e.currentTarget.value)}
                    onBlur={(e) => {
                        const val = e.currentTarget.value;
                        const result = ExerciseNameSchema.safeParse(val);
                        if (!result.success) return setError(true);
                        setError(false);
                        mutation.mutate(val);
                    }}
                />
                <DeleteExerciseButton workoutId={props.workout_id} exerciseId={props.id} />
                </Group>
            </Box>

            <Stack p="md" gap="xs">
                <Group gap="xs" mb={4} px={4} wrap="nowrap">
                    <Text size="xs" fw={700} c="dimmed" style={{ flex: '0 0 45px', textAlign: 'center' }}>SET</Text>
                    <Text size="xs" fw={700} c="dimmed" style={{ flex: 1, textAlign: 'center' }}>PREVIOUS</Text>
                    <Text size="xs" fw={700} c="dimmed" style={{ flex: 1, textAlign: 'center' }}>REPS</Text>
                    <Text size="xs" fw={700} c="dimmed" style={{ flex: 1, textAlign: 'center' }}>KG</Text>
                </Group>
                {props.sets.map(set => (
                    <SetCard key={set.id} {...set} exercise_id={props.id} workout_id={props.workout_id} />
                ))}
                
                <Box mt="sm">
                    <AddSetButton exercise_id={props.id} workout_id={props.workout_id} />
                </Box>
            </Stack>
        </Paper>

    )
}


