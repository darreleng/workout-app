import { Box, Group, Paper, Stack, TextInput, Text, Loader } from "@mantine/core";
import { ExerciseNameSchema, type Exercise } from "../../../../shared/schemas";
import AddSetButton from "./AddSetButton";
import SetCard from "./SetCard";
import DeleteExerciseButton from "./DeleteExerciseButton";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";

export default function ExerciseCard(props: Exercise) {
    const queryClient = useQueryClient();
    const [localName, setLocalName] = useState(props.name);
    const [nameError, setNameError] = useState(false);

    const updateExerciseName = useMutation({
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
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
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

    const updateSetField = useMutation({
        mutationFn: async ({ updatedField, value, setId }: { updatedField: string, value: number, setId: string })=> {
            const res = await fetch(`http://localhost:3000/api/workouts/${props.workout_id}/exercises/${props.id}/sets/${setId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ [updatedField]: value })
            });
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
        // TODO: REMOVE OR REWORK ERROR NOTIFICATIONS
        onError: (error) => {
            notifications.show({
                title: 'Failed to modify set',
                message: error.message,
                color: 'red',
                autoClose: 2000,
                icon: <IconX stroke={2} size={20} />,            
            });
        }
    });
    
    const deleteSet = useMutation({
        mutationFn: async (setId: string) => {
            const res = await fetch(`http://localhost:3000/api/workouts/${props.workout_id}/exercises/${props.id}/sets/${setId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to delete set');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workouts', props.workout_id] });
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
        onError: (error) => {
            notifications.show({ 
                title: 'Error', 
                message: error.message, 
                color: 'red' 
            });
        }
    });

    const { 
        data: filteredExercises,
        isPending,
        error
    } = useQuery({
        queryKey: ['exercises'],
        queryFn: async (): Promise<Exercise[]> => {
            const res = await fetch(`http://localhost:3000/api/exercises`, {credentials: 'include'});
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
        select: (exercises) => [...exercises]
                                .filter(ex => ex.name === localName)
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    });

    if (isPending) return <div><Loader size='sm' /></div>; 
    if (error) return <div>Error: {error.message}</div>;
    
    return (
        <Paper withBorder shadow="sm">
            <Box px='sm' py='4' style={{ borderBottom: '1px solid var(--mantine-color-gray-8)'}}>
                <Group justify="space-between">
                    <TextInput 
                        variant="unstyled"
                        flex={1}
                        fw={600}
                        styles={{ 
                            input: { 
                                fontSize: '1.1rem', 
                                minHeight: 0,
                                height: '100%'
                            }
                        }}
                        value={localName}
                        onChange={(e) => setLocalName(e.currentTarget.value)}
                        onBlur={(e) => {
                            const val = e.currentTarget.value;
                            const result = ExerciseNameSchema.safeParse(val);
                            if (!result.success) return setNameError(true);
                            setNameError(false);
                            updateExerciseName.mutate(val);
                        }}
                    />
                    <DeleteExerciseButton workoutId={props.workout_id} exerciseId={props.id} />
                </Group>
            </Box>

            <Stack p="md" gap="xs">
                <Group gap="xs" mb={4} wrap="nowrap">
                    <Text size="xs" fw={700} c="dimmed" style={{ flex: '0 0 45px', textAlign: 'center' }}>SET</Text> 
                    <Text size="xs" fw={700} c="dimmed" style={{ flex: 1, textAlign: 'center' }}>PREVIOUS</Text>
                    <Text size="xs" fw={700} c="dimmed" style={{ flex: 1, textAlign: 'center' }}>REPS</Text>
                    <Text size="xs" fw={700} c="dimmed" style={{ flex: 1, textAlign: 'center' }}>KG</Text>
                </Group>
                {props.sets.map(set => {
                    const prevExerciseSet = filteredExercises[1]?.sets.filter(s => s.set_number === set.set_number)[0];
                    return <SetCard key={set.id} {...set} id={props.id} prevExerciseSet={prevExerciseSet} workout_id={props.workout_id} 
                                updateSetField={(updatedField, value) => updateSetField.mutate({ updatedField, value, setId: set.id})}
                                deleteSet={() => deleteSet.mutate(set.id)}
                    />
                })}
                
                <Box mt="sm">
                    <AddSetButton exercise_id={props.id} workout_id={props.workout_id} />
                </Box>
            </Stack>
        </Paper>
    )
}


