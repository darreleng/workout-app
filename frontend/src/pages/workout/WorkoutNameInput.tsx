import { TextInput } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { WorkoutNameSchema } from "../../../../shared/schemas";
import classes from './WorkoutNameInput.module.css';

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
    });
    
    return (
        <TextInput 
            variant="unstyled"
            flex={1}
            classNames={{ input: classes.input }}
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