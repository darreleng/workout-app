import { Group, Paper, Stack, Title } from "@mantine/core";
import type { ExerciseCardProps } from "../../shared/schemas";
import AddSetButton from "./AddSetButton";
import SetCard from "./SetCard";
import DeleteExerciseButton from "./DeleteExerciseButton";

export default function ExerciseCard(props: ExerciseCardProps) {

    return (
        <Paper>
            <Stack>
                <Group justify="space-between">
                    <Title>{props.name}</Title>
                    <DeleteExerciseButton workoutId={props.workout_id} exerciseId={props.id} />
                </Group>
                {props.sets.map(set => (
                    <SetCard {...set} exercise_id={props.id} workout_id={props.workout_id} />
                ))}
            </Stack>
            <AddSetButton exercise_id={props.id} workout_id={props.workout_id}/>
        </Paper>

    )
}
