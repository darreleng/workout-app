import { Group, NumberInput, Menu, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconTrash, IconX } from "@tabler/icons-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { UpdateSetSchema, type SetCardProps } from "../../../../shared/schemas";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";

export default function SetCard(props: SetCardProps) {
    const form = useForm({
        initialValues: {
            weight_kg: Number(props.weight_kg) || 0,
            reps: props.reps || 0,
            rest_seconds: props.rest_seconds || 0
        },
        mode: 'uncontrolled',
        validate: zod4Resolver(UpdateSetSchema),
        validateInputOnBlur: true
    })

    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: async ({ updatedField, value }: { updatedField: string; value: number })=> {
            const res = await fetch(`http://localhost:3000/api/workouts/${props.workout_id}/exercises/${props.exercise_id}/sets/${props.id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ [updatedField]: value })
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
    
    const deleteMutation = useMutation({
        mutationFn: async (setId: string) => {
            const res = await fetch(`http://localhost:3000/api/workouts/${props.workout_id}/exercises/${props.exercise_id}/sets/${setId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to delete set');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workouts', props.workout_id] });
        },
        onError: (error) => {
            notifications.show({ 
                title: 'Error', 
                message: error.message, 
                color: 'red' 
            });
        }
    });

    return(
        <Group key={props.id}>
            <Menu shadow="md">
                <Menu.Target>
                    <NumberInput 
                        label='SET' 
                        readOnly 
                        hideControls={true} 
                        value={props.set_number} 
                        styles={{
                            input: { cursor: 'pointer' }
                        }}
                        />
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => deleteMutation.mutate(props.id)}>
                        Delete workout
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
            <TextInput 
                label='PREVIOUS' 
                readOnly 
                value={`${props.reps} x ${Number(props.weight_kg)} kg`} 
                styles={{
                    input: { pointerEvents: 'none'}
                }}
            />
            <NumberInput 
                label='REPS' 
                hideControls={true} 
                allowDecimal={false} 
                {...form.getInputProps('reps')}
                error={!!form.errors.reps}
                onBlur={() => {
                    const validation = form.validateField('reps');
                    if (!validation.hasError) updateMutation.mutate({ updatedField: 'reps', value: form.getValues().reps })
                }}
            />
            <NumberInput 
                label='WEIGHT (KG)' 
                hideControls={true} 
                {...form.getInputProps('weight_kg')}
                error={!!form.errors.weight_kg}
                onBlur={() => {
                    const validation = form.validateField('weight_kg');
                    if (!validation.hasError) updateMutation.mutate({ updatedField: 'weight_kg', value: form.getValues().weight_kg })
                }}
            />
        </Group>
    )

}