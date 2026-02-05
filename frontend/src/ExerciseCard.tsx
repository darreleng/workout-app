import { ActionIcon, Group, Paper, Stack, Title, NumberInput } from "@mantine/core";
import type { ExerciseCardProps } from "../../shared/schemas";
import AddSetButton from "./AddSetButton";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";

export default function ExerciseCard(props: ExerciseCardProps) {
    const mutation = useMutation({
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

    return (
        <Paper>
            <Stack>
                <Group>
                    <Title>{props.name}</Title>
                    <ActionIcon aria-label="Discard exercise"></ActionIcon>
                </Group>
                {props.sets.map(set => (
                    <Group key={set.id}>
                        <NumberInput label='SET' readOnly hideControls={true} defaultValue={set.set_number} styles={{ input: { cursor: 'default', pointerEvents: 'none' } }}/>
                        <NumberInput label='KG' defaultValue={set.weight_kg || ''} step={2.5} min={0} onBlur={e => mutation.mutate({ setId: set.id!, field: 'weight_kg', value: Number(e.target.value) })} />
                        <NumberInput label='REPS' defaultValue={set.reps || ''} min={1} onBlur={e => mutation.mutate({ setId: set.id!, field: 'reps', value: Number(e.target.value) })} />
                        <NumberInput label='REST' defaultValue={set.rest_seconds || ''} step={10} min={10} onBlur={e => mutation.mutate({ setId: set.id!, field: 'rest_seconds', value: Number(e.target.value) })} />
                    </Group>
                ))}
            </Stack>
            <AddSetButton exerciseId={props.id!} workoutId={props.workoutId!}/>
        </Paper>

    )
}
