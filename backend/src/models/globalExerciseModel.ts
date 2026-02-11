import { pool as db } from "src/db/db";

export async function getExerciseHistory(userId: string) {
    const query = `
        SELECT e.name, COUNT(DISTINCT e.workout_id)::int as workout_count, MAX(e.created_at) as last_done_at
        FROM exercises e
        JOIN workouts w ON e.workout_id = w.id
        WHERE w.user_id = $1
        GROUP BY e.name
        ORDER BY workout_count DESC
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
}
