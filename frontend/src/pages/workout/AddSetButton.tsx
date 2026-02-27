import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export default function AddSetButton({ exercise_id, workout_id }: { exercise_id: string, workout_id: string }) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/workouts/${workout_id}/exercises/${exercise_id}/sets`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workouts', workout_id] })
        },
    });

    return (
        <Button variant='subtle' leftSection={<IconPlus stroke={2} size={20} />} loading={mutation.isPending} fullWidth onClick={() => mutation.mutate()}>
            Add Set
        </Button>
    );
}