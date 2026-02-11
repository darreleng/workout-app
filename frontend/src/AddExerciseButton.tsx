import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, TextInput, Modal, ScrollArea, Stack, Text, Badge, Loader, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { ExerciseNameSchema } from '../../shared/schemas';
import { IconPlus, IconSearch } from '@tabler/icons-react';

interface exerciseHistory {
    name: string,
    workout_count: number,
    last_done_at: string
}

export default function AddExerciseButton({ workoutId }: { workoutId: string }) {
    const [nameError, setNameError] = useState('');
    const [opened, { open, close }] = useDisclosure(false);
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');

    const { 
        data: history,
        isPending,
        error
    } = useQuery({
        queryKey: ['exerciseHistory'],
        queryFn: async () => {
            const res = await fetch(`http://localhost:3000/api/exercises/history`, {credentials: 'include'});
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
        // enabled: opened
    });

    const mutation = useMutation({
        mutationFn: async (exerciseName: string) => {
            const res = await fetch(`http://localhost:3000/api/workouts/${workoutId}/exercises`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exerciseName }),
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts', workoutId] }),
    });

    function handleCreate(name?: string) {
        const valueToValidate = name || search;
        const result = ExerciseNameSchema.safeParse(valueToValidate);
        if (!result.success) return setNameError(result.error.issues[0].message);
        mutation.mutate(result.data);
        close();
        setNameError('');
        setSearch('');
    };

    function handleClose() {
        close();
        setSearch('');
    };

    if (isPending) return <div><Loader size='sm' /></div>; 
    if (error) return <div>Error: {error.message}</div>;

    const filteredHistory: [] = history.filter((item: any) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Modal 
                opened={opened} 
                onClose={handleClose} 
                title="Add Exercise" 
                size="md"
                yOffset={0}
                styles={{
                    content: {
                        height: '100dvh',
                        display: 'flex',
                        flexDirection: 'column',
                    },
                    body: {
                        flex: 1,
                        display: 'flex', 
                        flexDirection: 'column', 
                        overflow: 'hidden',
                    },
                }}
                >
                <TextInput
                    placeholder="Search or type new exercise..."
                    leftSection={<IconSearch stroke={2} />}
                    value={search}
                    error={!!nameError && nameError}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                    mb="md"
                    data-autofocus 
                />
                {nameError}
                
                <ScrollArea
                    type="always"
                    scrollbars="y"
                    scrollbarSize={6}
                    styles={{
                        root: {
                            flexGrow: 1
                        }
                    }}
                >
                    <Text size="xs" fw={700} c="dimmed" mb="xs" >
                        {search ? 'Search Results' : 'Past Exercises'}
                    </Text>

                    <Stack gap={0} >
                        {filteredHistory.map((ex: exerciseHistory) => (
                            <>
                            <Button
                                key={ex.name} 
                                variant='default'
                                justify='left'
                                bd='none'
                                pl='0'
                                fullWidth
                                h={'fit-content'}
                                onClick={() => handleCreate(ex.name)}
                            >
                                <Stack align='flex-start' gap='0'>
                                    <Text size='xl' fw={700}>{ex.name}</Text>
                                    <Text size='xs' >IN {ex.workout_count} WORKOUTS</Text>
                                    {/* <Badge variant="light" color="orange" radius="xs">IN {ex.workout_count} WORKOUTS</Badge> */}
                                </Stack>
                            </Button>
                            <Divider />
                            </>
                            
                        ))}
                        
                    </Stack>
                    {search && filteredHistory.length === 0 && "No exercise with this name"}

                </ScrollArea>

                <Button fullWidth mih='2rem' mt='md' onClick={() => handleCreate()}>Create exercise</Button>
            </Modal>

            <Button leftSection={<IconPlus stroke={2} size={20} />} fullWidth onClick={open}>
                Add exercise
            </Button>
        </>
    )
}