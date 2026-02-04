import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, TextInput, Group, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { ExerciseNameSchema } from '../../shared/schemas';
import { IconPlus } from '@tabler/icons-react';

export default function AddExerciseButton({ workoutId }: { workoutId: string }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [opened, { open, close }] = useDisclosure(false);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (exerciseName: string) => {
        const res = await fetch(`http://localhost:3000/api/workouts/${workoutId}/exercises`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: exerciseName }),
            credentials: 'include',
        });
        return res.json();
    },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workout', workoutId] }),
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const validationResult = ExerciseNameSchema.safeParse(name);
        if (!validationResult.success) return setError(validationResult.error.issues[0].message);
        mutation.mutate(validationResult.data);
        close();
        setName('');
    };

    function handleClose() {
        close();
        setError('');
        setName('');
    };

    return (
        <Group mt="md">
            <Modal opened={opened} onClose={handleClose} withCloseButton={false}>
                <form onSubmit={handleSubmit}>
                    Exercise name:
                    <TextInput 
                        placeholder="e.g., Bench Press" 
                        value={name} 
                        onChange={(e) => setName(e.currentTarget.value)}
                        error={error}
                    />
                    <Group grow>
                        <Button color='red' onClick={handleClose}>Cancel</Button>
                        <Button color='green' type='submit'>Create</Button>
                    </Group>
                </form>
            </Modal>

            <Button leftSection={<IconPlus stroke={2} size={20} />} fullWidth onClick={open}>
                Add Exercise
            </Button>
        </Group>
    );
}