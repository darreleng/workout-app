import { pool as db } from "src/db/db";
import { ExerciseType } from "@shared/schemas";

// export async function createExercise(userId: string, workoutId: string, exerciseData: ExerciseType, client?: any) {
//     const { name, sets, reps, weight_kg, rest_seconds } = exerciseData;
//     const query = 'INSERT INTO exercises (workout_id, name, sets, reps, weight_kg, rest_seconds) SELECT $1, $2, $3, $4, $5, $6 WHERE EXISTS (SELECT 1 FROM workouts WHERE id = $1 AND user_id = $7) RETURNING *';
//     const executor = client || db;
//     const { rows } = await executor.query(query, [workoutId, name, sets, reps, weight_kg, rest_seconds, userId]);
//     return rows[0];
// }

export async function createExercise(userId: string, workoutId: string, exerciseName: string) {
    const query = 'INSERT INTO exercises (workout_id, name) SELECT $2, $3 WHERE EXISTS (SELECT 1 FROM workouts where id = $2 AND user_id = $1) RETURNING *'
    const { rows } = await db.query(query, [userId, workoutId, exerciseName]);
    return rows[0];
}

export async function updateExercise(userId: string, exerciseId: string, exerciseData: ExerciseType) {
    const { name, sets, reps, weight_kg, rest_seconds } = exerciseData;
    const query = 'UPDATE exercises SET name = $3, sets = $4, reps = $5, weight_kg = $6, rest_seconds = $7 WHERE id = $2 AND workout_id IN (SELECT id FROM workouts WHERE user_id = $1) RETURNING *';
    const { rows } = await db.query(query, [userId, exerciseId, name, sets, reps, weight_kg, rest_seconds]);
    return rows[0];
}

export async function deleteExercise(userId: string, exerciseId: string) {
    const query = 'DELETE FROM exercises e WHERE id = $1 AND EXISTS (SELECT 1 FROM workouts w WHERE w.id = e.workout_id AND w.user_id = $2) RETURNING *';
    const { rows } = await db.query(query, [exerciseId, userId]);
    return rows[0];
}

export async function getAllExercises(userId: string, workoutId: string) {
    const query = 'SELECT * FROM exercises WHERE workout_id = $1 AND workout_id IN (SELECT id FROM workouts WHERE user_id = $2)';
    const { rows } = await db.query(query, [workoutId, userId]);
    return rows;
}