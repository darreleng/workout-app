import { ActionIcon, Group, Paper, Stack, Text, Title, Menu, Badge } from "@mantine/core";
import { IconBarbell, IconCalendar, IconClock, IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { Link } from "react-router";
import type { WorkoutProps } from "../../../../shared/schemas";
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
        <Paper 
        withBorder 
        radius="md" 
        p="md" 
        shadow="sm"
        style={{ 
            cursor: 'pointer',
            transition: 'transform 200ms ease, box-shadow 200ms ease',
        }}
        // Adds a subtle lift effect on hover
        styles={{
            root: {
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 'var(--mantine-shadow-md)',
            }
            }
        }}
        >
        <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap="xs" style={{ flex: 1 }}>
            {/* Top Row: Date Badge */}
            <Group gap={6}>
                <IconCalendar size={14} color="var(--mantine-color-dimmed)" />
                <Text size="xs" c="dimmed" fw={500}>
                {new Date(created_at).toLocaleDateString(undefined, { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short' 
                })}
                </Text>
            </Group>

            {/* Title: Big and bold */}
            <Title order={3} lineClamp={1} style={{ letterSpacing: '-0.3px' }}>
                {name || "Untitled Workout"}
            </Title>

            {/* Stats Row: Using subtle background boxes */}
            <Group gap="sm" mt="xs">
                <Badge variant="light" color="blue" leftSection={<IconBarbell size={12} />}>
                {/* {total_volume?.toLocaleString() || 0} kg */}
                </Badge>
                <Badge variant="light" color="gray" leftSection={<IconClock size={12} />}>
                {/* {duration || '--'} min */}
                </Badge>
            </Group>
            </Stack>

            {/* Menu: Keeps it clean and tucked away */}
            <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="lg" radius="xl">
                <IconDotsVertical size={20} stroke={1.5} />
                </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>Workout Options</Menu.Label>
                <Menu.Item 
                component={Link} 
                to={`/workouts/${id}`} 
                leftSection={<IconEdit size={16} />}
                >
                View/Edit Workout
                </Menu.Item>
                <Menu.Item 
                color="red" 
                leftSection={<IconTrash size={16} />} 
                onClick={(e) => {
                    e.stopPropagation(); // Prevents navigating to workout when deleting
                    mutation.mutate(id);
                }}
                >
                Delete Workout
                </Menu.Item>
            </Menu.Dropdown>
            </Menu>
        </Group>
        </Paper>
    );
}