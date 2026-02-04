import { pool as db } from "src/db/db";
import type { SetType } from "@shared/schemas";

export async function getSets(userId: string, workoutId: string) {
    const query = 'SELECT s.* FROM sets s JOIN exercises e ON s.exercise_id = e.id JOIN workouts w ON e.workout_id = w.id WHERE w.id = $2 AND w.user_id = $1';
    const { rows } = await db.query(query, [userId, workoutId]);
    return rows;
}

export async function createSet(userId: string, setData: SetType) {
    const { exercise_id, set, weight_kg, reps, rest_seconds }  = setData;
    const query = 'INSERT INTO sets (exercise_id, set_number, weight_kg, reps, rest_seconds) SELECT $2, $3, $4, $5, $6 WHERE EXISTS (SELECT 1 FROM exercises where id = $2 AND user_id = $1) RETURNING *'
    const { rows } = await db.query(query, [userId, exercise_id, set, weight_kg, reps, rest_seconds]);
    return rows;
}
