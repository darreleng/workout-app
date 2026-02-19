import { Group, NumberInput, Menu, TextInput, Box } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
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

    return(
        <Group gap="xs" wrap="nowrap" align="flex-start">
            <Menu shadow="md">
                <Menu.Target>
                    <Box style={{ flex: '0 0 45px' }}>
                        <NumberInput 
                        readOnly 
                        hideControls 
                        value={props.set_number} 
                        variant="filled"
                        styles={{ input: { cursor: 'pointer', textAlign: 'center', fontWeight: 700 } }}
                        />
                    </Box>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => props.deleteSet()}>
                        Delete Set
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>

        {/* PREVIOUS */}
        <TextInput 
            readOnly 
            value={props.reps ? `${props.reps} x ${Number(props.weight_kg)} kg`: '-'}
            placeholder="--"
            variant="unstyled"
            style={{ flex: 1 }}
            styles={{ input: { pointerEvents: 'none', color: 'var(--mantine-color-dimmed)', textAlign: 'center', fontSize: 'var(--mantine-font-size-xs)' } }}
        />

        {/* REPS */}
        <NumberInput 
            hideControls 
            allowDecimal={false} 
            placeholder="0"
            {...form.getInputProps('reps')}
            error={!!form.errors.reps}
            style={{ flex: 1 }}
            styles={{ input: { textAlign: 'center' } }}
            onBlur={() => {
                const validation = form.validateField('reps');
                if (!validation.hasError) props.updateSetField('reps', form.getValues().reps)
            }}
        />

        {/* WEIGHT */}
        <NumberInput 
            hideControls 
            placeholder="0"
            {...form.getInputProps('weight_kg')}
            error={!!form.errors.weight_kg}
            style={{ flex: 1 }}
            styles={{ input: { textAlign: 'center' } }}
            onBlur={() => {
                const validation = form.validateField('weight_kg');
                if (!validation.hasError) props.updateSetField('weight_kg', form.getValues().weight_kg)
            }}
        />
        </Group>
    )
}

