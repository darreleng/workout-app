import { ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function DeleteWorkoutButton({ workoutId }: { workoutId: string}) {
    const queryClient = useQueryClient();

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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workout', workoutId] });
        },
        // TODO: Think of error notifcation
        onError: (error) => {
            console.log(error);
        }
    })

    return (
        <ActionIcon color="red" aria-label="Delete workout" onClick={() => mutation.mutate(workoutId)}>
            <IconTrash stroke={2} />
        </ActionIcon>
    )
}