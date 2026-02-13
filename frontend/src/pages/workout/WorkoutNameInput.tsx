import { TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { WorkoutNameSchema } from "../../../../shared/schemas";

export default function WorkoutNameInput({ workoutName, id }: { workoutName: string, id: string}) {
    const [localName, setLocalName] = useState(workoutName);
    const [nameError, setNameError] = useState(false);
    
    const mutation = useMutation({
        mutationFn: async (updatedName: string) => {
            const res = await fetch(`http://localhost:3000/api/workouts/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ updatedName })
            });
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
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
            aria-label="Workout name"
            value={localName} 
            error={nameError}
            onChange={(e) => setLocalName(e.currentTarget.value)}
            onBlur={(e) => {
                const val = e.currentTarget.value;
                const result = WorkoutNameSchema.safeParse(val);
                if (!result.success) return setNameError(true);
                setNameError(false);
                mutation.mutate(val);
            }}
        />
    )
}