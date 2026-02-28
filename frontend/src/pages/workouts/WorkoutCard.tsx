import { ActionIcon, Group, Paper, Stack, Text, Title, Menu, Badge, Box, UnstyledButton, Button, Modal, SimpleGrid } from "@mantine/core";
import { IconCalendar, IconChevronDown, IconChevronUp, IconDotsVertical, IconEdit, IconNote, IconStopwatch, IconTrash } from '@tabler/icons-react';
import { Link } from "react-router";
import type { WorkoutProps } from "../../../../shared/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import classes from './WorkoutCard.module.css';
import { formatSeconds} from "../../formatDuration";
import { useDisclosure } from "@mantine/hooks";

export default function WorkoutCard({ id, name, created_at, workout_total_volume, duration_seconds, notes }: WorkoutProps) {
    const queryClient = useQueryClient();
    const [opened, { toggle }] = useDisclosure(false);
    const [isDeleteModalOpen, deleteModal] = useDisclosure(false);

    const mutation = useMutation({
        mutationFn: async (workoutId: string) => {
            const res = await fetch(`/api/workouts/${workoutId}`, {
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
    })

    return (
        <Paper withBorder p="md" shadow="sm"className={classes.myPaper}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap="xs" style={{ flex: 1 }}>
                    <Group justify="space-between">
                        <Group gap={'6'}>
                            <IconCalendar size={14} color="var(--mantine-color-dimmed)" />
                            <Text size="xs" c="dimmed" fw={500} lh={0}>
                                {new Date(created_at).toLocaleDateString(undefined, {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    year: "numeric"
                                })}
                            </Text>
                            <Badge ml={10} variant="light" color="dark.2" radius={0} leftSection={<IconStopwatch size={12} />}>
                                {formatSeconds(duration_seconds) || '--'}
                            </Badge>
                        </Group>
                        <Menu shadow="xs" position="bottom-end">
                            <Menu.Target>
                                <ActionIcon variant="subtle" color="gray" size="lg" classNames={{root: classes.icon}}>
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
                                    onClick={deleteModal.open}
                                >
                                    Delete Workout
                                </Menu.Item>
                            </Menu.Dropdown>
                            <Modal opened={isDeleteModalOpen} onClose={deleteModal.close} withCloseButton={false} centered>
                                <Stack gap="md">
                                    <Text size="sm" c="dimmed">Are you sure you want to delete this workout?</Text>
                                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                        <Button variant="light" color="gray" onClick={deleteModal.close}>Cancel</Button>
                                        <Button color="red" onClick={(e) => {e.stopPropagation(); mutation.mutate(id);}}>Delete</Button>
                                    </SimpleGrid>
                                </Stack>
                            </Modal>
                        </Menu>
                    </Group>

                    <Title order={3} lineClamp={1} style={{ letterSpacing: '-0.3px' }}>
                        {name || "Untitled Workout"}
                    </Title>
                </Stack>

                
            </Group>
            {notes && (
                <UnstyledButton 
                    onClick={toggle} 
                    w="100%" 
                    mt="sm"
                    style={{ textAlign: 'left' }}
                >
                    <Box p="xs" bg="dark.5" >
                        <Group justify="space-between" mb={2}>
                            <Group gap={4} c="dimmed">
                                <IconNote size={12} />
                                <Text size="xs" fw={800} tt="uppercase">Notes</Text>
                            </Group>
                            <Group gap={2} c="dimmed">
                                <Text size="xs" fw={500}>{opened ? 'Show less' : 'Show more'}</Text>
                                {opened ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
                            </Group>
                        </Group>
                        <Text size="sm" c="dimmed" lineClamp={opened ? 0 : 2}>
                            {notes}
                        </Text>
                    </Box>
                </UnstyledButton>
            )}
        </Paper>
    );
}