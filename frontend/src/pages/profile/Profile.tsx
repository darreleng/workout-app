import { Avatar, Button, Group, Text } from '@mantine/core';
import { authClient } from '../../auth-client';

export default function Profile() {

    async function handleSignOut() {
        await authClient.signOut();
    }

    const { data } = authClient.useSession();

    return (
    <>
        <Group wrap="nowrap">
            <Avatar
                src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png"
                size={94}
                radius="md"
                alt="Robert Glassbreaker"
            />
            <div>
                <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
                    Software engineer
                </Text>

                <Text fz="lg" fw={500}>
                    {data?.user.name}
                </Text>

                <Group wrap="nowrap" gap={10} mt={3}>
                <Text fz="xs" c="dimmed">
                    robert@glassbreaker.io
                </Text>
                </Group>

                <Group wrap="nowrap" gap={10} mt={5}>
                <Text fz="xs" c="dimmed">
                    +11 (876) 890 56 23
                </Text>
                </Group>
            </div>
            <Button onClick={handleSignOut}>Sign out</Button>
        </Group>

    </>
    );
}