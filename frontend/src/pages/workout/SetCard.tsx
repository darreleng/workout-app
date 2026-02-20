import { Group, NumberInput, Menu, TextInput, Box } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { UpdateSetSchema, type SetCardProps } from "../../../../shared/schemas";
import { useState } from "react";

const RepsSchema = UpdateSetSchema.shape.reps;
const WeightSchema = UpdateSetSchema.shape.weight_kg;

export default function SetCard(props: SetCardProps) {
    const [repsError, setRepsError] = useState(false);
    const [weightError, setWeightError] = useState(false);

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
            value={props.prevExerciseSet.reps ? `${props.prevExerciseSet.reps} x ${Number(props.prevExerciseSet.weight_kg)} kg`: '-'}
            variant="unstyled"
            style={{ flex: 1 }}
            styles={{ input: { pointerEvents: 'none', color: 'var(--mantine-color-dimmed)', textAlign: 'center', fontSize: 'var(--mantine-font-size-xs)' } }}
        />

        {/* REPS */}
        <NumberInput 
            hideControls 
            allowDecimal={false} 
            defaultValue={props.reps || undefined}
            error={repsError}
            onBlur={(e) => {
                const value = Number(e.target.value);
                const result = RepsSchema.safeParse(value);
                if (!result.success) return setRepsError(true);
                if (value !== props.reps) props.updateSetField('reps', result.data!);
                setRepsError(false);                
            }}
            style={{ flex: 1 }}
            styles={{ input: { textAlign: 'center' } }}
            />

        {/* WEIGHT */}
        <NumberInput 
            hideControls 
            allowDecimal={false} 
            defaultValue={props.weight_kg || undefined}
            error={weightError}
            onBlur={(e) => {
                const value = Number(e.target.value);
                const result = WeightSchema.safeParse(value);
                if (!result.success) return setWeightError(true);
                if (value !== props.weight_kg) props.updateSetField('weight_kg', result.data!);
                setWeightError(false);                
            }}
            style={{ flex: 1 }}
            styles={{ input: { textAlign: 'center' } }}
            />
        </Group>
    )
}

