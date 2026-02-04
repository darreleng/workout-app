import { pool as db } from "src/db/db";

export async function getSets(userId: string, workoutId: string) {
    const query = 'SELECT s.* FROM sets s JOIN exercises e ON s.exercise_id = e.id JOIN workouts w ON e.workout_id = w.id WHERE w.id = $2 AND w.user_id = $1';
    const { rows } = await db.query(query, [userId, workoutId]);
    return rows;
}
