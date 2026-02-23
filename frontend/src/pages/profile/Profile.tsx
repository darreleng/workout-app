import { Avatar, Box, Button, Container, Group, Loader, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { authClient } from '../../auth-client';
import { IconMail, IconBarbell, IconCalendar, IconLogout, IconClock, IconWeight } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { formatSeconds } from '../../formatDuration';

interface Stats {
    total_workouts: number;
    total_volume: number;
    total_time: number;
}

export default function Profile() {

    async function handleSignOut() {
        await authClient.signOut();
    }

    const { data } = authClient.useSession();

    const {
        data: stats,
        error,
        isLoading
    } = useQuery<Stats>({
        queryKey: ['stats'],
        queryFn: async () => {
            const res = await fetch(`http://localhost:3000/api/workouts/stats`, {credentials: 'include'});
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        }
    })

    if (isLoading) return <Loader color="blue" />;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <Box bg="var(--mantine-color-gray-0)" mih="100vh" py="xl">
            <Container size="md">
                <Stack gap="xl">
                <Paper withBorder p="xl" radius="md" shadow="sm">
                    <Stack align="center" gap="xs">
                    <Avatar size={100} radius={100} color="blue" variant="light" src={data?.user.image} />
                    
                    <Stack gap={8} align="center">
                        <Title order={2} fw={800}>{data?.user.name}</Title>
                        
                        <Group gap="xs" c="dimmed">
                        <IconMail size={16} />
                        <Text size="sm" lh={1}>{data?.user.email}</Text>
                        </Group>

                        <Group gap="xs" c="dimmed">
                        <IconCalendar size={16} />
                        <Text size="sm" lh={1}>Member since {data?.user.createdAt.toLocaleDateString()}</Text>
                        </Group>
                    </Stack>
                    </Stack>
                </Paper>

                <SimpleGrid 
                    cols={{ base: 1, sm: 3 }}
                    spacing="md"
                >
                    <StatsCard 
                        label="Workouts" 
                        value={stats?.total_workouts} 
                        icon={<IconBarbell size={20} />} 
                        color="blue" 
                    />

                    <StatsCard 
                        label="Total Volume" 
                        value={`${Number(stats?.total_volume)} kg`} 
                        icon={<IconWeight size={20} />} 
                        color="grape" 
                    />

                    <StatsCard 
                        label="Total Time" 
                        value={`${formatSeconds(stats!.total_time)}`} 
                        icon={<IconClock size={20} />} 
                        color="teal" 
                    />
                </SimpleGrid>

                <Button 
                    variant="light" 
                    color="red" 
                    leftSection={<IconLogout size={20} />}
                    fullWidth
                    size="md"
                    radius="md"
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
    <Paper withBorder p="md" radius="md" shadow="xs" style={{ flex: 1, minWidth: '200px' }}>
      <Stack gap={4} align="center">
        <ThemeIcon variant="light" color={color} size="lg" radius="md">
          {icon}
        </ThemeIcon>
        <Text fw={800} size="xl" mt="xs">{value}</Text>
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.5px">{label}</Text>
      </Stack>
    </Paper>
  );
}