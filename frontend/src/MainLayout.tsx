import { Outlet, useNavigate, useLocation } from "react-router"
import { SegmentedControl, Text, Box, Center, ActionIcon, Button, Group, Modal, Paper, SimpleGrid, Stack } from '@mantine/core';
import { IconUser, IconBarbell, IconChartBar, IconPointFilled, IconTrash } from '@tabler/icons-react';
import classes from './MainLayout.module.css';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDuration } from "./formatDuration";
import { useWorkoutTimer } from "./useWorkoutTimer";
import { useDisclosure } from "@mantine/hooks";

interface ActiveWorkout {
    id: string;
    name: string;
    created_at: string;
}

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentValue = location.pathname.split('/')[1] || 'workouts';
    const [opened, { open, close }] = useDisclosure(false);
    const queryClient = useQueryClient();

    const { data: activeWorkout } = useQuery<ActiveWorkout>({
        queryKey: ['activeWorkout'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3000/api/workouts/active', { credentials: 'include' });
            if (!res.ok) return null;
            return res.json();
        },
        refetchInterval: 60000,
    });

    const discardWorkout = useMutation({
        mutationFn: async (workoutId: string) => {
            const res = await fetch(`http://localhost:3000/api/workouts/${workoutId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workouts'], exact: true });
            queryClient.removeQueries({ queryKey: ['activeWorkout'] });
        },
        onError: (error) => {
            console.log(error);
        }
    })

    const elapsedSeconds = formatDuration(useWorkoutTimer(activeWorkout?.created_at));

    return (
    <>
        <Outlet context={activeWorkout} />
        <Box 
            className={classes.navContainer} 
            style={{ 
                position: 'fixed', 
                bottom: 20, 
                left: '50%', 
                transform: 'translateX(-50%)',
                zIndex: 1000,
                width: 'calc(100% - 40px)',
                maxWidth: 450 
            }}
        >
            <Stack gap={8}>
            {activeWorkout && (
                <Paper 
                    withBorder 
                    shadow="md" 
                    radius="xl" 
                    p="xs" 
                    bg="var(--mantine-color-blue-filled)"
                    c="white"
                    style={{ cursor: 'pointer' }}
                >
                    <Group justify="space-between" wrap="nowrap">
                        <Group 
                            gap="xs" 
                            style={{ flex: 1 }} 
                            onClick={() => navigate(`/workouts/${activeWorkout.id}`)}
                        >
                            <Box className={classes.iconWrapper}>
                                <Box className={classes.ripple} />
                                <IconPointFilled 
                                    size={18} 
                                    color="white" 
                                    style={{ position: 'relative', zIndex: 1 }} 
                                />
                            </Box>
                            <Group gap={20} flex='1' justify="space-between">
                                <Text size="sm" opacity={'.8'} fw={800}>{activeWorkout.name}</Text>
                                <Text size="sm" fw={800}>{elapsedSeconds}</Text>
                            </Group>
                        </Group>

                        <ActionIcon 
                            variant="subtle" 
                            color="white" 
                            radius="xl"
                            onClick={(e) => {
                                e.stopPropagation();
                                open();
                            }}
                        >
                            <IconTrash size={16} />
                        </ActionIcon>
                    </Group>
                </Paper>
            )}

            <Modal opened={opened} onClose={close} title={<Text fw={700}>Discard active workout?</Text>} centered radius="md">
                <Stack gap="md">
                    <Text size="sm" c="dimmed">This will permanently delete your current progress.</Text>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                        <Button variant="light" color="gray" onClick={close}>Keep Workout</Button>
                        <Button color="red" onClick={() => { discardWorkout.mutate(activeWorkout!.id); close(); }}>Discard</Button>
                    </SimpleGrid>
                </Stack>
            </Modal>

                <Paper shadow="lg" radius="xl" withBorder className={classes.segmentedRoot}>
                    <SegmentedControl
                        radius="xl"
                        size="md"
                        fullWidth={true}
                        withItemsBorders={false}
                        classNames={{
                            root: classes.segmentedRoot,
                            indicator: classes.indicator,
                        }}
                        value={currentValue}
                        onChange={(value) => navigate(`/${value.toLowerCase()}`)}
                        data={[
                            { 
                                value: 'profile', 
                                label: (
                                    <Center style={{ gap: 10 }}>
                                        <IconUser size={16} />
                                        <Text size="sm">Profile</Text>
                                    </Center>
                                ) 
                            },
                            { 
                                value: 'workouts', 
                                label: (
                                    <Center style={{ gap: 10 }}>
                                        <IconBarbell size={16} />
                                        <Text size="sm">Workouts</Text>
                                    </Center>
                                ) 
                            },
                            { 
                                value: 'progress', 
                                label: (
                                    <Center style={{ gap: 10 }}>
                                        <IconChartBar size={16} />
                                        <Text size="sm">Progress</Text>
                                    </Center>
                                ) 
                            }
                        ]}
                    />
                </Paper>
            </Stack>
        </Box>
    </>
    )
}

