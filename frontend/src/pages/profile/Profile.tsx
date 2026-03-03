import { Avatar, Box, Button, Center, Container, Group, Loader, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { authClient } from '../../auth-client';
import { IconMail, IconBarbell, IconCalendar, IconLogout, IconWeight, IconStopwatch } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatSeconds } from '../../formatDuration';
import { useNavigate, useOutletContext } from 'react-router';
import classes from './Profile.module.css';
import { useState } from 'react';

interface Stats {
    total_workouts: number;
    total_volume: number;
    total_time: number;
}

export default function Profile() {
    const queryClient = useQueryClient();
    const activeWorkout = useOutletContext();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const navigate = useNavigate();
    const { data: session } = authClient.useSession();

    async function handleSignOut() {
        setIsSigningOut(true);
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    navigate('/signin');
                    queryClient.clear();
                }
            }
        });
    }

    const {
        data: stats,
        error,
        isLoading
    } = useQuery<Stats>({
        queryKey: ['stats', session?.user?.id],
        queryFn: async () => {
            const res = await fetch(`/api/workouts/stats`, {credentials: 'include'});
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
        enabled: !isSigningOut
    })

    if (isLoading) return <Center h={'100svh'}><Loader size='xl' /></Center>; 
    if (!session || error) return null;

    return (
        <Box className={classes.wrapper} pb={{ base: activeWorkout ? 80 : 56 }}>
            <Container size="sm" className={classes.responsiveContainer}>
                <Stack>
                <Paper withBorder p="lg">
                    <Stack align="center" gap="xs">
                        <Avatar size={100} color="volt" radius={0} variant="light" src={session?.user?.image} />
                        <Stack gap={8} align="center">
                            <Title order={2} fw={800}>{session?.user.name}</Title>
                            <Group gap="xs" c="dimmed">
                                <IconMail size={16} />
                                <Text size="sm" lh={1}>{session?.user.email}</Text>
                            </Group>
                            <Group gap="xs" c="dimmed">
                                <IconCalendar size={16} />
                                <Text size="sm" lh={1}>Member since {session?.user.createdAt.toLocaleDateString()}</Text>
                            </Group>
                        </Stack>
                    </Stack>
                </Paper>

                <SimpleGrid 
                    cols={{ base: 1, sm: 3 }}
                    spacing="xs"
                >
                    <StatsCard 
                        label="Workouts" 
                        value={stats?.total_workouts} 
                        icon={<IconBarbell size={20} />} 
                        color="volt" 
                    />

                    <StatsCard 
                        label="Total Volume" 
                        value={`${Number(stats?.total_volume)} kg`} 
                        icon={<IconWeight size={20} />} 
                        color="grape.6" 
                    />

                    <StatsCard 
                        label="Total Time" 
                        value={stats ? formatSeconds(stats.total_time) : '0:00'}
                        icon={<IconStopwatch size={20} />} 
                        color="cyan.5" 
                    />
                </SimpleGrid>

                <Button 
                    variant="light" 
                    color="red" 
                    leftSection={<IconLogout size={20} />}
                    fullWidth
                    size="md"
                    onClick={handleSignOut}
                >
                    Sign out
                </Button>

                </Stack>
            </Container>
        </Box>
    );
}

function StatsCard({ label, value, icon, color }: { label: string, value: any, icon: any, color: string }) {
  return (
    <Paper withBorder p="md" shadow="xs" style={{ flex: 1, minWidth: '200px' }}>
      <Stack gap={4} align="center">
        <ThemeIcon variant="light" color={color} size="lg">
            {icon}
        </ThemeIcon>
        <Text fw={800} size="xl" mt="xs">{value}</Text>
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.5px">{label}</Text>
      </Stack>
    </Paper>
  );
}