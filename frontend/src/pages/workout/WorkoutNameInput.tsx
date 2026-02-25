import { TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { WorkoutNameSchema } from "../../../../shared/schemas";

export default function WorkoutNameInput({ workoutName, id }: { workoutName: string, id: string}) {
    const [nameError, setNameError] = useState(false);
    const queryClient = useQueryClient();
    
    const mutation = useMutation({
        mutationFn: async (name: string) => {
            const res = await fetch(`http://localhost:3000/api/workouts/${id}`, {
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
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
        },
        // TODO: REMOVE OR REWORK ERROR NOTIFICATIONS
        onError: (error) => {
            notifications.show({
                title: 'Failed to modify workout name',
                message: error.message,
                color: 'red',
                autoClose: 2000,
            });
        }
    });
    
    return (
        <TextInput 
            variant="unstyled"
            fw={700}
            flex={1}
            styles={{
                input: {
                    height: '100%',
                    fontSize: '1.2rem',
                    minHeight: 0
                }
            }}
            aria-label="Workout name"
            defaultValue={workoutName} 
            error={nameError}
            onBlur={(e) => {
                const val = e.currentTarget.value;
                const result = WorkoutNameSchema.safeParse({ name: val });
                if (!result.success) return setNameError(true);
                if (result.data.name !== workoutName) mutation.mutate(val);
                setNameError(false);
            }}
        />
    )
}