import { ActionIcon, Group, Paper, Stack, Text, Title, Menu } from "@mantine/core";
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { Link } from "react-router";
import type { WorkoutProps } from "../../shared/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function WorkoutCard({id, name, created_at}: WorkoutProps) {
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
            console.log("Success!")
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
        },
        // TODO: Think of error notifcation
        onError: (error) => {
            console.log(error);
        }
    })

    return (
        <Paper shadow="xs" mih={100} mt={4} mb={4} p={16}>
            <Group justify="space-between">
                <Stack gap="xs" justify="center">
                    <Text size="xs" mb={-8}>
                        {new Date(created_at).toLocaleDateString()}
                    </Text>
                    <Title order={2} lineClamp={1}>
                        {name}
                    </Title>
                </Stack>
                    <Menu shadow="md" width={180}>
                        <Menu.Target>
                            <ActionIcon size={40}>
                                <IconDotsVertical stroke={2} />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item component={Link} to={`/workouts/${id}`} leftSection={<IconEdit size={14} />}>
                                View/edit workout
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => mutation.mutate(id)}>
                                Delete workout
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>                
            </Group>
        </Paper>
    )
}