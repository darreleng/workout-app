import { ActionIcon, Group, Paper, Stack, Text, Title, Menu, Badge, Box, UnstyledButton } from "@mantine/core";
import { IconBarbell, IconCalendar, IconChevronDown, IconChevronUp, IconClock, IconDotsVertical, IconEdit, IconNote, IconTrash } from '@tabler/icons-react';
import { Link } from "react-router";
import type { WorkoutProps } from "../../../../shared/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import classes from './WorkoutCard.module.css';
import { formatSeconds} from "../../formatDuration";
import { useDisclosure } from "@mantine/hooks";

export default function WorkoutCard({ id, name, created_at, workout_total_volume, duration_seconds, notes }: WorkoutProps) {
    const queryClient = useQueryClient();
    const [opened, { toggle }] = useDisclosure(false);

    const mutation = useMutation({
        mutationFn: async (workoutId: string) => {
            const res = await fetch(`http://localhost:3000/api/workouts/${workoutId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workouts'], exact: true });
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
            queryClient.removeQueries({ queryKey: ['activeWorkout'] });
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
            className={classes.myPaper}
        >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap="xs" style={{ flex: 1 }}>
                    <Group gap={6}>
                        <IconCalendar size={14} color="var(--mantine-color-dimmed)" />
                        <Text size="xs" c="dimmed" fw={500}>
                            {new Date(created_at).toLocaleDateString(undefined, { 
                                weekday: 'short', 
                                day: 'numeric', 
                                month: 'short',
                                year: "numeric"
                            })}
                        </Text>
                    </Group>

                    <Title order={3} lineClamp={1} style={{ letterSpacing: '-0.3px' }}>
                        {name || "Untitled Workout"}
                    </Title>

                    <Group gap="sm" mt="xs">
                        <Badge variant="light" color="blue" leftSection={<IconBarbell size={12} />}>
                            {Number(workout_total_volume) || 0} kg
                        </Badge>
                        <Badge variant="light" color="gray" leftSection={<IconClock size={12} />}>
                            {formatSeconds(duration_seconds) || '--'}
                        </Badge>
                    </Group>
                </Stack>

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
                                e.stopPropagation(); 
                                mutation.mutate(id);
                            }}
                        >
                        Delete Workout
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
                
            </Group>
{notes && (
        <UnstyledButton 
            onClick={toggle} 
            w="100%" 
            mt="sm"
            style={{ textAlign: 'left' }}
        >
            <Box 
                p="xs" 
                bg="var(--mantine-color-gray-0)" 
                style={{ 
                    borderRadius: 'var(--mantine-radius-sm)',
                    transition: 'background-color 150ms ease',
                }}
                // Subtle hover effect
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)'}
            >
                <Group justify="space-between" mb={2}>
                    <Group gap={4}>
                        <IconNote size={12} color="var(--mantine-color-dimmed)" />
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">Notes</Text>
                    </Group>
                    
                    {/* Visual toggle cue */}
                    <Group gap={2} c="dimmed">
                        <Text size="xs" fw={500}>{opened ? 'Show less' : 'Show more'}</Text>
                        {opened ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
                    </Group>
                </Group>

                <Text size="sm" c="gray.7" lineClamp={opened ? 0 : 2}>
                    {notes}
                </Text>
            </Box>
        </UnstyledButton>
    )}
        </Paper>
    );
}