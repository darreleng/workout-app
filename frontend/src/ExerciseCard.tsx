import { ActionIcon, Button, Group, Paper, Stack, Title, Text, NumberInput, TextInput } from "@mantine/core";
import type { ExerciseType } from "../../shared/schemas";
import { IconPlus } from "@tabler/icons-react";

export default function ExerciseCard(props: ExerciseType) {

    return (
    <Paper>
        <Stack>
            <Group>
                <Title>{props.name}</Title>
                <ActionIcon aria-label="Discard exercise"></ActionIcon>
            </Group>
            <Group>
                {/* <NumberInput label={'SET'} disabled hideControls={true} defaultValue={props.sets}></NumberInput>
                <NumberInput label={'KG'} defaultValue={props.weight_kg}></NumberInput>
                <NumberInput label={'REPS'} defaultValue={props.reps}></NumberInput>
                <NumberInput label={'REST'} defaultValue={props.rest_seconds}></NumberInput> */}
                
            </Group>
        </Stack>
        <Button leftSection={<IconPlus stroke={2} size={20}/>} fullWidth>Add set</Button>
    </Paper>

    )
}



                // <Stack>
                //     <Text>SET</Text>
                //     <Text>{props.sets}</Text>
                // </Stack>
                // <Stack>
                //     <Text>KG</Text>
                //     <NumberInput value={props.weight_kg}></NumberInput>
                // </Stack>
                // <Stack>
                //     <Text>REPS</Text>
                //     <Text>{props.reps}</Text>
                // </Stack>
                // <Stack>
                //     <Text>REST</Text>
                //     <Text>{props.rest_seconds}</Text>
                // </Stack>