import * as z from "zod";

// function titleCase(str: string) {
//   return str.replace(/\b\w/g, (char) => char.toUpperCase());
// };

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const WorkoutSchema = z.object({
    name: z.coerce.string().trim().min(1, "Workout name must be at least 1 character").transform(capitalizeFirstLetter)
})

export const ExerciseSchema = z.object({
    id: z.string().optional(),
    workoutId: z.string().optional(),
    name: z.coerce.string().trim().min(3, "Exercise name must at least be 1 character").transform(val => capitalizeFirstLetter(val))
})

export const ExerciseNameSchema = ExerciseSchema.shape.name;

export const SetSchema = z.object({
    id: z.string().optional(),
    exercise_id: z.string().optional(),
    set_number: z.coerce.number().min(1, "At least 1 set required"),
    weight_kg: z.coerce.number().nonnegative(),
    reps: z.coerce.number().min(1, "At least 1 rep required"),
    rest_seconds: z.coerce.number().nonnegative()
})

export const WorkoutWithExercisesSchema = WorkoutSchema.extend({
    exercises: z.array(ExerciseSchema).min(1, "You must add at least one exercise to your workout")
})

export type WorkoutType = z.infer<typeof WorkoutSchema>;
export type ExerciseType = z.infer<typeof ExerciseSchema>;
export type SetType = z.infer<typeof SetSchema>;
export type FullWorkoutType = z.infer<typeof WorkoutWithExercisesSchema>;
export type ExerciseCardProps = ExerciseType & {
    sets: SetType[];
};
