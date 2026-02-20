import { pool as db } from "src/db/db";

export async function getSets(userId: string, workoutId: string) {
    const query = 'SELECT s.* FROM sets s JOIN exercises e ON s.exercise_id = e.id JOIN workouts w ON e.workout_id = w.id WHERE w.id = $2 AND w.user_id = $1 ORDER BY s.set_number ASC';
    const { rows } = await db.query(query, [userId, workoutId]);
    return rows;
}

export async function createSet(userId: string, exerciseId: string) {
    const query = 
    `INSERT INTO sets (exercise_id, set_number)
    SELECT $2, COALESCE(MAX(set_number), 0) + 1 
    FROM sets WHERE exercise_id = $2 
    AND EXISTS (SELECT 1 FROM exercises e JOIN workouts w ON e.workout_id = w.id WHERE e.id = $2 AND w.user_id = $1) RETURNING *;`;
    const { rows } = await db.query(query, [userId, exerciseId]);
                            
    if (rows.length === 0) {
        throw new Error("Unauthorized or Exercise not found");
    }
    return rows[0];
}

export async function updateSet(userId: string, setId: string, field: { weight_kg?: number, reps?: number }) {
    const query = 
    `UPDATE sets SET 
        weight_kg = COALESCE($3, weight_kg), 
        reps = COALESCE($4, reps), 
    WHERE id = $2 
    AND EXISTS (
        SELECT 1 FROM exercises e
        JOIN workouts w ON e.workout_id = w.id
        WHERE e.id = sets.exercise_id
        AND w.user_id = $1
    )
    RETURNING *`;
    const values = [userId, setId, field.weight_kg ?? null, field.reps ?? null];
    const { rows } = await db.query(query, values);
    return rows[0]; 
}

export async function deleteSet(userId: string, setId: string) {
	const client = await db.connect();
	try {
		await client.query('BEGIN');

	const infoRes = await client.query(
		`SELECT s.exercise_id, s.set_number FROM sets s
		JOIN exercises e ON s.exercise_id = e.id
		JOIN workouts w ON e.workout_id = w.id
		WHERE s.id = $1 AND w.user_id = $2`,
		[setId, userId]
	);

    if (infoRes.rows.length === 0) throw new Error("Set not found or unauthorized");
    const { exercise_id, set_number } = infoRes.rows[0];

    await client.query('DELETE FROM sets WHERE id = $1', [setId]);

    await client.query(
		`UPDATE sets 
		SET set_number = set_number - 1 
		WHERE exercise_id = $1 AND set_number > $2`,
		[exercise_id, set_number]
	);
    await client.query('COMMIT');
    return { success: true };
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}