import { ActionIcon, Menu } from '@mantine/core';
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
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
        // TODO: Think of error notifcation
        onError: (error) => {
            console.log(error);
        }
    })

    return (
        <Menu shadow="md" width={150}>
            <Menu.Target>
                <ActionIcon color="red" aria-label="Delete Exercise">
                    <IconTrash stroke={2} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item color="red" onClick={() => mutation.mutate({workoutId, exerciseId})}>
                    Delete Exercise
                </Menu.Item>
            </Menu.Dropdown>
        </Menu> 

    )
}