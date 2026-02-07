import { ActionIcon, Group, Paper, Stack, Title, NumberInput, Button, Popover } from "@mantine/core";
import type { ExerciseCardProps } from "../../shared/schemas";
import AddSetButton from "./AddSetButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";

export default function ExerciseCard(props: ExerciseCardProps) {
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: async ({ setId, field, value }: { setId: string, field: string, value: number }) => {
            const res = await fetch(`http://localhost:3000/api/workouts/${props.workout_id}/exercises/${props.id}/sets/${setId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ [field]: value })
            });
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
        // TODO: REMOVE OR REWORK ERROR NOTIFICATIONS
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
    
    console.log(props)

    const deleteMutation = useMutation({
        mutationFn: async (setId: string) => {
            const res = await fetch(`http://localhost:3000/api/workouts/${props.workout_id}/exercises/${props.id}/sets/${setId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to delete set');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workout', props.workout_id] });
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
                        <Popover position="bottom" withArrow shadow="md" offset={0}>
                            <Popover.Target>
                                <NumberInput 
                                    label='SET' 
                                    readOnly 
                                    hideControls={true} 
                                    value={set.set_number} 
                                    />
                            </Popover.Target>
                            <Popover.Dropdown>
                                <Button color="red" onClick={() => deleteMutation.mutate(set.id)} fullWidth>Remove set</Button>
                            </Popover.Dropdown>
                        </Popover>
                        <NumberInput 
                            label='WEIGHT (KG)' 
                            defaultValue={set.weight_kg !== null ? Number(set.weight_kg) : ''} 
                            min={0} 
                            clampBehavior="blur" 
                            hideControls={true} 
                            onBlur={e => updateMutation.mutate({ setId: set.id, field: 'weight_kg', value: Number(e.target.value) })} 
                            />
                        <NumberInput 
                            label='REPS' 
                            defaultValue={set.reps || ''} 
                            hideControls={true} 
                            min={0} 
                            clampBehavior="blur" 
                            allowDecimal={false} 
                            onBlur={e => updateMutation.mutate({ setId: set.id, field: 'reps', value: Number(e.target.value) })} 
                            />
                        <NumberInput 
                            label='REST (S)' 
                            defaultValue={set.rest_seconds || ''} 
                            hideControls={true} 
                            min={0} 
                            clampBehavior="blur" 
                            allowDecimal={false} 
                            onBlur={e => updateMutation.mutate({ setId: set.id, field: 'rest_seconds', value: Number(e.target.value) })} 
                            />
                    </Group>
                ))}
            </Stack>
            <AddSetButton exerciseId={props.id} workoutId={props.workout_id}/>
        </Paper>

    )
}
