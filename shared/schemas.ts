import * as z from "zod";

function titleCase(str: string) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

// function capitalizeFirstLetter(str: string) {
//     return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
// };

export const WorkoutNameSchema = z.coerce.string().trim().min(1, "Workout name must be at least 1 character").transform(titleCase);

export const ExerciseNameSchema = z.coerce.string().trim().min(1, "Exercise name must at least be 1 character").transform(titleCase)

export const UpdateSetSchema = z.object({
    weight_kg: z.coerce.number().max(9999.999).nonnegative(),
    reps: z.coerce.number().min(1),
}).partial()

export type WorkoutProps = {
    name: string;
    id: string;
    created_at: string;
};

export interface Exercise {
    id: string;
    name: string;
    created_at: string;
    workout_id: string;
    sets: {
        id: string;
        set_number: number;
        reps: number;
        weight_kg: number;
    }[]
};

export type SetCardProps = {
    id: string;
    set_number: number;
    reps: number;
    weight_kg: number;
    workout_id: string;
    prevExerciseSet: {
        id: string;
        set_number: number;
        reps: number;
        weight_kg: number;
    }
    updateSetField: (updatedField: string, value: number) => void;
    deleteSet: () => void;
};

export type WorkoutWithExercisesAndSets = {
    id: string;
    name: string;
    // createdAt: string;
    // completedAt: string;
    // notes: string;
    exercises: Exercise[];
};

