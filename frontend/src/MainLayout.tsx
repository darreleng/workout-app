import { Outlet, useNavigate, useLocation } from "react-router"
import { SegmentedControl, Text, Box, Center, ActionIcon, Button, Group, Modal, Paper, SimpleGrid, Stack, Container } from '@mantine/core';
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
            const res = await fetch('/api/workouts/active', { credentials: 'include' });
            if (!res.ok) return null;
            return res.json();
        },
        refetchInterval: 60000,
    });

    const discardWorkout = useMutation({
        mutationFn: async (workoutId: string) => {
            const res = await fetch(`/api/workouts/${workoutId}`, {
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
            <Box className={classes.navContainer} >
                <Stack gap={0}>
                {activeWorkout && (
                    <Group justify="space-between" align="center" className={classes.activeWorkout}>
                        <Group 
                            gap="xs" 
                            flex='1'
                            align='1'
                            onClick={() => navigate(`/workouts/${activeWorkout.id}`)}
                        >
                            <Box className={classes.iconWrapper}>
                                <Box className={classes.ripple} />
                                <IconPointFilled size={16} color="white" />
                            </Box>
                            <Group flex='1' align='center' justify="space-between">
                                <Text size="xs" lh={0} c={'dark.9'} fw={800}>{activeWorkout.name}</Text>
                                <Text size="xs" lh={0} c={'dark.9'} fw={800}>{elapsedSeconds}</Text>
                            </Group>
                        </Group>

                        <ActionIcon 
                            variant="subtle" 
                            onClick={(e) => {
                                e.stopPropagation();
                                open();
                            }}
                        >
                            <IconTrash size={16} color="white" />
                        </ActionIcon>
                    </Group>

                )}

                    <Modal opened={opened} onClose={close} withCloseButton={false} centered>
                        <Stack gap="md">
                            <Text size="sm" c="dimmed">Are you sure you want to discard this workout?</Text>
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                <Button variant="light" color="gray" onClick={close}>Cancel</Button>
                                <Button color="red" onClick={() => { discardWorkout.mutate(activeWorkout!.id); close(); }}>Discard</Button>
                            </SimpleGrid>
                        </Stack>
                    </Modal>

                    <SegmentedControl
                        withItemsBorders={false}
                        classNames={{
                            root: classes.segmentedRoot,
                            indicator: classes.indicator,
                            label: classes.label
                        }}
                        value={currentValue}
                        onChange={(value) => navigate(`/${value.toLowerCase()}`)}
                        data={[
                            { 
                                value: 'profile', 
                                label: (
                                    <Center style={{ gap: 10 }}>
                                        <IconUser size={16} />
                                        <Text className={classes.labelText}>Profile</Text>
                                    </Center>
                                ) 
                            },
                            { 
                                value: 'workouts', 
                                label: (
                                    <Center style={{ gap: 10 }}>
                                        <IconBarbell size={16} />
                                        <Text className={classes.labelText}>Workouts</Text>
                                    </Center>
                                ) 
                            },
                            { 
                                value: 'progress', 
                                label: (
                                    <Center style={{ gap: 10 }}>
                                        <IconChartBar size={16} />
                                        <Text className={classes.labelText}>Progress</Text>
                                    </Center>
                                ) 
                            }
                        ]}
                    />
                </Stack>
            </Box>
        </>
    )
}

