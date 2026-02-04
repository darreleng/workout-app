import { ActionIcon, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { IconEdit } from '@tabler/icons-react';

interface WorkoutProps {
    name: string;
    created_at: Date;
}

export default function WorkoutCard({name, created_at}: WorkoutProps) {
    return (
        <Paper shadow="xs" mih={100} mt={4} mb={4} p={16}>
            <Group justify="space-between">
                <Stack gap="xs" justify="center">
                    <Text size="xs" mb={-8}>
                        {created_at.toLocaleDateString()}
                    </Text>
                    <Title order={2} lineClamp={1}>
                        {name}
                    </Title>
                </Stack>
                <ActionIcon size={40}>
                    <IconEdit stroke={2} />
                </ActionIcon>
                
            </Group>
        </Paper>
    )
}