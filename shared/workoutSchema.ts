import * as z from "zod";

export const WorkoutSchema = z.object({
    name: z.coerce.string().trim().min(1, "Workout name must be at least 1 character")
})

export const ExerciseSchema = z.object({
   name: z.coerce.string().trim().toUpperCase().min(1, "Exercise name must at least be 1 character"),
   sets: z.coerce.number().min(1, "At least 1 set required"),
   reps: z.coerce.number().min(1, "At least 1 rep required"),
   weight_kg: z.coerce.number().nonnegative(),
   rest_seconds: z.coerce.number().nonnegative()
})

export const WorkoutWithExercisesSchema = WorkoutSchema.extend({
    exercises: z.array(ExerciseSchema).min(1, "You must add at least one exercise to your workout")
})

export type WorkoutInput = z.infer<typeof WorkoutSchema>;
export type ExerciseInput = z.infer<typeof ExerciseSchema>;
export type FullWorkoutInput = z.infer<typeof WorkoutWithExercisesSchema>;