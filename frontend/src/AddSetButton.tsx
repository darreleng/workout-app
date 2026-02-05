import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import { notifications } from "@mantine/notifications";

export default function AddSetButton({ exerciseId, workoutId }: { exerciseId: string, workoutId: string }) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`http://localhost:3000/api/workouts/${workoutId}/exercises/${exerciseId}/sets`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workout', workoutId] }),
        onError: (error) => {
            notifications.show({
                title: 'Failed to add a set',
                message: error.message,
                color: 'red',
                autoClose: 2000,
                icon: <IconX stroke={2} size={20} />,            
            });
        }
    });

    return (
        <Button leftSection={<IconPlus stroke={2} size={20} />} loading={mutation.isPending} fullWidth onClick={() => mutation.mutate()}>
            Add set
        </Button>
    );
}