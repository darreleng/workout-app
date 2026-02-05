import { ActionIcon, Button, Group, Paper, Stack, Title, Text, NumberInput, TextInput } from "@mantine/core";
import type { ExerciseCardProps } from "../../shared/schemas";
import AddSetButton from "./AddSetButton";

export default function ExerciseCard(props: ExerciseCardProps) {
    console.log(props)
    return (
        <Paper>
            <Stack>
                <Group>
                    <Title>{props.name}</Title>
                    <ActionIcon aria-label="Discard exercise"></ActionIcon>
                </Group>
                {props.sets.map(set => (
                    <Group key={set.id}>
                        <NumberInput label='SET' disabled hideControls={true} defaultValue={set.set_number} />
                        <NumberInput label='KG' defaultValue={set.weight_kg} />
                        <NumberInput label='REPS' defaultValue={set.reps} />
                        <NumberInput label='REST' defaultValue={set.rest_seconds} />
                    </Group>
                ))}
            </Stack>
            <AddSetButton exerciseId={props.id!} workoutId={props.workout_id!}/>
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