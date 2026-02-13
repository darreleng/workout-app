import { ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function DeleteExerciseButton({ workoutId, exerciseId }: { workoutId: string, exerciseId: string}) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ workoutId, exerciseId }: { workoutId: string, exerciseId: string }) => {
            const res = await fetch(`http://localhost:3000/api/workouts/${workoutId}/exercises/${exerciseId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workouts', workoutId] });
            queryClient.invalidateQueries({ queryKey: ['exerciseHistory'] });
        },
        // TODO: Think of error notifcation
        onError: (error) => {
            console.log(error);
        }
    })

    return (
        <ActionIcon color="red" aria-label="Delete exercise" onClick={() => mutation.mutate({workoutId, exerciseId})}>
            <IconTrash stroke={2} />
        </ActionIcon>
    )
}