import { pool as db } from "src/db/db";

export async function createExercise(userId: string, workoutId: string, exerciseName: string) {
    const query = 'INSERT INTO exercises (workout_id, name) SELECT $2, $3 WHERE EXISTS (SELECT 1 FROM workouts where id = $2 AND user_id = $1) RETURNING *'
    const { rows } = await db.query(query, [userId, workoutId, exerciseName]);
    return rows[0];
}

export async function deleteExercise(userId: string, exerciseId: string, workoutId: string) {
    const query = 'DELETE FROM exercises e WHERE id = $2 AND workout_id = $3 AND EXISTS (SELECT 1 FROM workouts w WHERE w.id = e.workout_id AND w.user_id = $1) RETURNING *';
    const { rows } = await db.query(query, [userId, exerciseId, workoutId]);
    return rows[0];
}

export async function getExercises(userId: string, workoutId: string) {
    const query = 'SELECT e.* FROM exercises e JOIN workouts w ON e.workout_id = w.id WHERE w.id = $2 AND w.user_id = $1';
    const { rows } = await db.query(query, [userId, workoutId]);
    return rows;
}