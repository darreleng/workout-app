import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, TextInput, Modal, ScrollArea, Stack, Text, Badge, Loader, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Fragment, useState } from 'react';
import { ExerciseNameSchema } from '../../../../shared/schemas';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { type WorkoutWithExercisesAndSets } from "../../../../shared/schemas";

interface Exercise {
    id: string;
    name: string;
    created_at: string;
    sets: {
        id: string;
        set_number: number;
        reps: number;
        weight: number;
    }[]
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
            queryClient.invalidateQueries({ queryKey: ['workouts', workoutId] });
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        }
    });

    if (isPending) return <div><Loader size='sm' /></div>; 
    if (error) return <div>Error: {error.message}</div>;

    const currentWorkout = queryClient.getQueryData<WorkoutWithExercisesAndSets>(['workouts', workoutId]);
    const exerciseNames = currentWorkout!.exercises?.map(exercise => exercise.name);
    const filteredHistory = history.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    function handleAdd(e: React.FormEvent, name?: string) {
        e.preventDefault();
        const valueToValidate = name || search;
        const result = ExerciseNameSchema.safeParse(valueToValidate);
        if (!result.success) return setNameError(result.error.issues[0].message);
        const isDuplicate = exerciseNames.some(name => name.toLowerCase() === valueToValidate.toLocaleLowerCase());
        if (isDuplicate) return alert('This exercise already exists in your workout'); // TODO: proper error notification
        mutation.mutate(result.data);
        close();
        setNameError('');
        setSearch('');
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
                        overflowY: 'hidden',
                        paddingInline: 0,
                        paddingBottom: 0,
                    },
                }}
            >
                <form 
                    onSubmit={(e) => handleAdd(e)}
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'hidden' 
                    }}
                >
                    <TextInput
                        placeholder="Search or type new exercise..."
                        leftSection={<IconSearch stroke={2} />}
                        value={search}
                        error={!!nameError}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        mb="md"
                        px='md'
                        data-autofocus
                    />
                    <Text size="xs" fw={700} c="dimmed" px='md'>
                        {search ? 'Search Results' : 'Past Exercises'}
                    </Text>
                    
                    <ScrollArea
                        type="always"
                        scrollbars="y"
                        scrollbarSize={6}
                        style={{ flex: 1 }}                      
                    >
                        <Stack gap={0}>
                            {filteredHistory.map((ex) => (
                                <Fragment key={ex.name}>
                                    <Button
                                        variant='default'
                                        justify='left'
                                        bd='none'
                                        fullWidth
                                        h={'fit-content'}
                                        onClick={(e) => handleAdd(e, ex.name)}
                                    >
                                        <Stack align='flex-start' gap='0' py="xs">
                                            <Text size='xl' fw={700}>{ex.name}</Text>
                                            <Text size='xs' c="dimmed">IN {ex.workoutCount} WORKOUTS</Text>
                                        </Stack>
                                    </Button>
                                    <Divider />
                                </Fragment>
                            ))}
                        </Stack>
                        {search && filteredHistory.length === 0 && (
                            <Text mt="xl" c="dimmed">No exercise with this name</Text>
                        )}
                    </ScrollArea>

                    <Button 
                        mih='3rem'
                        m='md'
                        onClick={(e) => handleAdd(e)}
                    >
                        Add
                    </Button>
                </form>
            </Modal>

            <Button leftSection={<IconPlus stroke={2} size={20} />} fullWidth onClick={open}>
                Add exercise
            </Button>
        </>
    )
}