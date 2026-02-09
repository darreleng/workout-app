import { Group, Paper, Stack, TextInput } from "@mantine/core";
import { ExerciseNameSchema, type ExerciseCardProps } from "../../shared/schemas";
import AddSetButton from "./AddSetButton";
import SetCard from "./SetCard";
import DeleteExerciseButton from "./DeleteExerciseButton";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

export default function ExerciseCard(props: ExerciseCardProps) {
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
        <Paper>
            <Stack>
                <Group justify="space-between">
                    <TextInput 
                        aria-label="Exercise name"
                        value={localName} 
                        error={error}
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
                {props.sets.map(set => (
                    <SetCard key={set.id} {...set} exercise_id={props.id} workout_id={props.workout_id} />
                ))}
            </Stack>
            <AddSetButton exercise_id={props.id} workout_id={props.workout_id}/>
        </Paper>

    )
}
