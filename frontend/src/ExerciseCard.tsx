import { ActionIcon, Group, Paper, Stack, Title, NumberInput, Drawer, Button } from "@mantine/core";
import type { ExerciseCardProps } from "../../shared/schemas";
import AddSetButton from "./AddSetButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useDisclosure } from '@mantine/hooks';

export default function ExerciseCard(props: ExerciseCardProps) {
    const queryClient = useQueryClient();
    const [opened, { open, close }] = useDisclosure(false);

    const updateMutation = useMutation({
        mutationFn: async ({ setId, field, value }: { setId: string, field: string, value: number }) => {
            const res = await fetch(`http://localhost:3000/api/workouts/${props.workoutId}/exercises/${props.id}/sets/${setId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ [field]: value })
            });
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
        onError: (error) => {
            notifications.show({
                title: 'Failed to modify set',
                message: error.message,
                color: 'red',
                autoClose: 2000,
                icon: <IconX stroke={2} size={20} />,            
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (setId: string) => {
            const res = await fetch(`http://localhost:3000/api/workouts/${props.workoutId}/exercises/${props.id}/sets/${setId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to delete set');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workout', props.workoutId] });
        },
        onError: (error) => {
            notifications.show({ 
                title: 'Error', 
                message: error.message, 
                color: 'red' 
            });
        }
    });

    return (
        <Paper>
            <Stack>
                <Group>
                    <Title>{props.name}</Title>
                    <ActionIcon aria-label="Discard exercise"></ActionIcon>
                </Group>
                {props.sets.map(set => (
                    <Group key={set.id}>
                        <NumberInput label='SET' readOnly hideControls={true} defaultValue={set.setNumber} onClick={open}/>
                        <NumberInput label='KG' defaultValue={set.weightKg || ''} hideControls={true} min={0} onBlur={e => updateMutation.mutate({ setId: set.id!, field: 'weight_kg', value: Number(e.target.value) })} />
                        <NumberInput label='REPS' defaultValue={set.reps || ''} hideControls={true} min={1} onBlur={e => updateMutation.mutate({ setId: set.id!, field: 'reps', value: Number(e.target.value) })} />
                        <NumberInput label='REST' defaultValue={set.restSeconds || ''} hideControls={true}  min={10} onBlur={e => updateMutation.mutate({ setId: set.id!, field: 'rest_seconds', value: Number(e.target.value) })} />
                        <Drawer opened={opened} onClose={close} position="bottom" size='10%'>
                            <Button color="red" onClick={() => {deleteMutation.mutate(set.id!); close()}} fullWidth>Remove set</Button>
                        </Drawer>
                    </Group>
                ))}
            </Stack>
            <AddSetButton exerciseId={props.id!} workoutId={props.workoutId!}/>
        </Paper>

    )
}
