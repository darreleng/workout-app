import { ActionIcon, Group, Paper, Stack, Title } from "@mantine/core";
import type { ExerciseCardProps } from "../../shared/schemas";
import AddSetButton from "./AddSetButton";
import SetCard from "./SetCard";

export default function ExerciseCard(props: ExerciseCardProps) {

    return (
        <Paper>
            <Stack>
                <Group>
                    <Title>{props.name}</Title>
                    <ActionIcon aria-label="Discard exercise"></ActionIcon>
                </Group>
                {props.sets.map(set => (
                    <SetCard {...set} exercise_id={props.id} workout_id={props.workout_id} />
                ))}
            </Stack>
            <AddSetButton exercise_id={props.id} workout_id={props.workout_id}/>
        </Paper>

    )
}
