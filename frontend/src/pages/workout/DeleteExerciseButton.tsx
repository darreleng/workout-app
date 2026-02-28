import { ActionIcon, Button, Menu, Modal, SimpleGrid, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconTrash, IconDotsVertical } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function DeleteExerciseButton({ workoutId, exerciseId }: { workoutId: string, exerciseId: string}) {
    const [opened, { open, close }] = useDisclosure(false);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ workoutId, exerciseId }: { workoutId: string, exerciseId: string }) => {
            const res = await fetch(`/api/workouts/${workoutId}/exercises/${exerciseId}`, {
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
    })

    return (
        <Menu shadow="md" position='bottom-end'>
            <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="lg">
                    <IconDotsVertical size={20} stroke={1.5} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item color="red" onClick={open} leftSection={<IconTrash size={16} />} >
                    Delete Exercise
                </Menu.Item>
            </Menu.Dropdown>

            <Modal opened={opened} onClose={close} withCloseButton={false} centered>
                <Stack gap="md">
                    <Text size="sm" c="dimmed">Are you sure you want to delete this exercise?</Text>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                        <Button variant="light" color="gray" onClick={close}>Cancel</Button>
                        <Button color="red" onClick={() => mutation.mutate({workoutId, exerciseId})}>Delete</Button>
                    </SimpleGrid>
                </Stack>
            </Modal>
        </Menu> 
    )
}