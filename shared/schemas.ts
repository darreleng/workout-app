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

export type WorkoutProps = z.infer<typeof WorkoutNameSchema> & {
    id: string;
    createdAt: string;
};

export type ExerciseCardProps = {
    id: string;
    name: string;
    workoutId: string;
    sets: {
        id: string,
        exerciseId: string,
        setNumber: number,
        weightKg: number,
        reps: number,
        restSeconds: number
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