import { Group, NumberInput, Menu, TextInput, Box, Button, Modal, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { UpdateSetSchema, type SetCardProps } from "../../../../shared/schemas";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";

const RepsSchema = UpdateSetSchema.shape.reps;
const WeightSchema = UpdateSetSchema.shape.weight_kg;

export default function SetCard(props: SetCardProps) {
    const [repsError, setRepsError] = useState(false);
    const [weightError, setWeightError] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);

    return(
        <Group gap="xs" wrap="nowrap" align="flex-start">
            <Menu shadow="xs" position="bottom-start">
                <Menu.Target>
                    <Box style={{ flex: '0 0 45px' }}>
                        <NumberInput 
                        readOnly 
                        hideControls 
                        aria-label="Set Number"
                        value={props.set_number} 
                        variant="filled"
                        styles={{ input: { cursor: 'pointer', textAlign: 'center', fontWeight: 700 } }}
                        />
                    </Box>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={open}>
                        Delete Set
                    </Menu.Item>
                </Menu.Dropdown>
                <Modal opened={opened} onClose={close} withCloseButton={false} centered>
                    <Stack gap="md">
                        <Text size="sm" c="dimmed">Are you sure you want to delete this set?</Text>
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                            <Button variant="light" color="gray" onClick={close}>Cancel</Button>
                            <Button color="red" onClick={() => props.deleteSet()}>Delete</Button>
                        </SimpleGrid>
                    </Stack>
                </Modal>
            </Menu>

        {/* PREVIOUS */}
        <TextInput 
            readOnly 
            aria-label="Previous Exercise Set Benchmark"
            value={props.prevExerciseSet?.reps ? `${props.prevExerciseSet.reps} x ${Number(props.prevExerciseSet.weight_kg)} kg` : '-'}
            variant="unstyled"
            style={{ flex: 1 }}
            styles={{ input: { pointerEvents: 'none', color: 'var(--mantine-color-dimmed)', textAlign: 'center', fontSize: 'var(--mantine-font-size-xs)' } }}
        />

        {/* REPS */}
        <NumberInput 
            hideControls 
            allowDecimal={false} 
            aria-label="Reps"
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
            aria-label="Weight (kg)"
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

