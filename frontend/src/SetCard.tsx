import { Button, Group, NumberInput, Popover } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { UpdateSetSchema, type SetCardProps } from "../../shared/schemas";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";

export default function SetCard(props: SetCardProps) {
    const form = useForm({
        initialValues: {
            weight_kg: props.weight_kg !== null ? Number(props.weight_kg) : 0,
            reps: props.reps || 0,
            rest_seconds: props.rest_seconds || 0
        },
        mode: 'uncontrolled',
        validate: zod4Resolver(UpdateSetSchema),
        validateInputOnBlur: true
    })

    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: async ({ setId, field, value }: { setId: string, field: string, value: number }) => {
            const url = `http://localhost:3000/api/workouts/${props.workout_id}/exercises/${props.id}/sets/${setId}`;
    console.log("URL:", url);
    console.log("Body:", JSON.stringify({ [field]: value }));
            const res = await fetch(`http://localhost:3000/api/workouts/${props.workout_id}/exercises/${props.exercise_id}/sets/${setId}`, {
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

    // error={!!form.errors.weight_kg}

    return(
        <Group key={props.id}>
            <Popover position="bottom" withArrow shadow="md" offset={0}>
                <Popover.Target>
                    <NumberInput 
                        label='SET' 
                        readOnly 
                        hideControls={true} 
                        value={props.set_number} 
                        />
                </Popover.Target>
                <Popover.Dropdown>
                    <Button color="red" onClick={() => deleteMutation.mutate(props.id)} fullWidth>Remove set</Button>
                </Popover.Dropdown>
            </Popover>
            <NumberInput 
                label='WEIGHT (KG)' 
                hideControls={true} 
                {...form.getInputProps('weight_kg')}
                error={!!form.errors.weight_kg}
                onBlur={() => {
                    const validation = form.validateField('weight_kg');
                    if (!validation.hasError) updateMutation.mutate({ setId: props.id, field: 'weight_kg', value: form.getValues().weight_kg })
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
                    if (!validation.hasError) updateMutation.mutate({ setId: props.id, field: 'reps', value: form.getValues().reps })
                }}
            />
            <NumberInput 
                label='REST (S)' 
                hideControls={true} 
                allowDecimal={false}
                {...form.getInputProps('rest_seconds')} 
                error={!!form.errors.rest_seconds}
                onBlur={() => {
                    const validation = form.validateField('rest_seconds');
                    if (!validation.hasError) updateMutation.mutate({ setId: props.id, field: 'rest_seconds', value: form.getValues().rest_seconds })
                }}
            />
        </Group>
    )

}