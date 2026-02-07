import * as z from "zod";

// function titleCase(str: string) {
//   return str.replace(/\b\w/g, (char) => char.toUpperCase());
// };

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const WorkoutNameSchema = z.object({
    name: z.coerce.string().trim().min(1, "Workout name must be at least 1 character").transform(capitalizeFirstLetter)
});

export const ExerciseNameSchema = z.coerce.string().trim().min(3, "Exercise name must at least be 1 character").transform(val => capitalizeFirstLetter(val))

export const UpdateSetSchema = z.object({
    weight_kg: z.coerce.number().nonnegative().optional(),
    reps: z.coerce.number().nonnegative().optional(),
    rest_seconds: z.coerce.number().nonnegative().optional(),
})

export type WorkoutProps = z.infer<typeof WorkoutNameSchema> & {
    id: string;
    created_at: string;
};

export type ExerciseCardProps = {
    id: string;
    name: string;
    workout_id: string;
    sets: {
        id: string,
        exercise_id: string,
        set_number: number,
        weight_kg: number,
        reps: number,
        rest_seconds: number
    }[]
};

export type WorkoutWithExercisesAndSets = {
    id: string;
    name: string;
    // createdAt: string;
    // completedAt: string;
    // notes: string;
    exercises: ExerciseCardProps[];
};