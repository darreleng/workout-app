import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, TextInput, Modal, ScrollArea, Stack, Text, Loader, Box, Center, NavLink } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useState } from 'react';
import { ExerciseNameSchema } from '../../../../shared/schemas';
import { IconChevronRight, IconPlus, IconSearch } from '@tabler/icons-react';
import type { WorkoutWithExercisesAndSets, Exercise } from "../../../../shared/schemas";

export default function AddExerciseButton({ workoutId }: { workoutId: string }) {
    const [nameError, setNameError] = useState('');
    const [opened, { open, close }] = useDisclosure(false);
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const isMobile = useMediaQuery('(max-width: 40em)');

    const { 
        data: history,
        isPending,
        error
    } = useQuery({
        queryKey: ['exercises'],
        queryFn: async (): Promise<Exercise[]> => {
            const res = await fetch(`http://localhost:3000/api/exercises`, {credentials: 'include'});
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
        select: (exercises) => {
            const counts = exercises.reduce((acc, { name }) => {
                if (!acc[name]) acc[name] = { name, workoutCount: 0 };
                acc[name].workoutCount++;
                return acc;
            }, {} as Record<string, { name: string, workoutCount: number }>);

            return Object.values(counts);
        }
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
        onSuccess: () => {
            close();
            setNameError('');
            setSearch('');
            queryClient.invalidateQueries({ queryKey: ['workouts', workoutId] });
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        }
    });

    const { data: currentWorkout } = useQuery<WorkoutWithExercisesAndSets>({
        queryKey: ['workouts', workoutId],
        queryFn: async () => {
            const res = await fetch(`http://localhost:3000/api/workouts/${workoutId}`, {credentials: 'include'});
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        }
    });

    if (isPending) return <div><Loader size='sm' /></div>; 
    if (error) return <div>Error: {error.message}</div>;

    const exerciseNames = currentWorkout?.exercises?.map(exercise => exercise.name);
    const filteredHistory = history.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    function handleAdd(e: React.FormEvent, name?: string) {
        e.preventDefault();
        const valueToValidate = name || search;
        const result = ExerciseNameSchema.safeParse(valueToValidate);
        if (!result.success) return setNameError(result.error.issues[0].message);
        const isDuplicate = exerciseNames?.some(name => name.toLowerCase() === valueToValidate.toLocaleLowerCase());
        if (isDuplicate) return alert('This exercise already exists in your workout'); // TODO: proper error notification
        mutation.mutate(result.data);
    };

    function handleClose() {
        close();
        setSearch('');
        setNameError('');
    };

    return (
        <>
            <Modal 
                opened={opened} 
                onClose={handleClose} 
                title={<Text fw={700}>Add Exercise</Text>} 
                yOffset={isMobile ? 0 : '5dvh'}
                fullScreen={isMobile}
                size="md"
                padding="0"
                radius="md"
                styles={{
                    content: { height: '100dvh', display: 'flex', flexDirection: 'column' },
                    body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
                    header: { padding: '1rem 1rem 0 1rem', minHeight: 'auto'}
                }}
            >
                <form onSubmit={(e) => handleAdd(e)} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    
                    <Box p="md" pb="xs">
                        <TextInput
                            placeholder="Search exercises..."
                            leftSection={<IconSearch size={18} stroke={1.5} />}
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            variant="filled"
                            size="md"
                            radius="md"
                            data-autofocus
                        />
                    </Box>

                    <Text size="xs" fw={700} c="dimmed" px="md" mb="xs" tt="uppercase" lts="0.5px">
                        {search ? 'Search Results' : 'Recent Exercises'}
                    </Text>
                    
                    <ScrollArea style={{ flex: 1 }} scrollbars="y">
                        <Stack gap={0}>
                            {filteredHistory.map((ex) => (
                                <NavLink
                                    key={ex.name}
                                    p='md'
                                    styles={{
                                        root: { border: 0, borderBottom: '1px solid var(--mantine-color-gray-2)' }
                                    }}
                                    component='button'
                                    onClick={(e) => handleAdd(e, ex.name)}
                                    label={<Text fw={600} size="md" ta="left">{ex.name}</Text>}
                                    description={<Text size="xs" c="dimmed" ta="left">Used in {ex.workoutCount} workouts</Text>}
                                    rightSection={<IconChevronRight size={16} />}
                                />
                            ))}
                        </Stack>

                        {search && filteredHistory.length === 0 && (
                            <Center py="xl" px="md">
                                <Stack align="center" gap="xs">
                                    <Text c="dimmed" size="sm">No results for "{search}"</Text>
                                        <Button variant="light" size="xs" onClick={(e) => handleAdd(e)}>
                                        Add "{search}"
                                        </Button>
                                </Stack>
                            </Center>
                        )}
                    </ScrollArea>

                    <Box p="md" bg="var(--mantine-color-gray-0)" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                        <Button 
                            fullWidth 
                            size="md" 
                            radius="md"
                            onClick={(e) => handleAdd(e)}
                            disabled={!search}
                        >
                            {search ? `Add "${search}"` : 'Select an exercise'}
                        </Button>
                    </Box>
                </form>
            </Modal>

            <Button leftSection={<IconPlus stroke={2} size={20} />} fullWidth onClick={open}>
                Add Exercise
            </Button>
        </>
    )
}