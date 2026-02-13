import { pool as db } from "src/db/db";

export async function createExercise(userId: string, workoutId: string, exerciseName: string) {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        const exRes = await db.query('INSERT INTO exercises (workout_id, name) SELECT $2, $3 WHERE EXISTS (SELECT 1 FROM workouts where id = $2 AND user_id = $1) RETURNING *', [userId, workoutId, exerciseName]);
        if (exRes.rows.length === 0 ) return;
        const exerciseId = exRes.rows[0].id;
        const { rows } = await db.query(`INSERT INTO sets (exercise_id, set_number) VALUES ($1, 1) RETURNING *`, [exerciseId]);

        await client.query('COMMIT');
        return rows[0];
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}

export async function deleteExercise(userId: string, exerciseId: string, workoutId: string) {
    const query = 'DELETE FROM exercises e WHERE id = $2 AND workout_id = $3 AND EXISTS (SELECT 1 FROM workouts w WHERE w.id = e.workout_id AND w.user_id = $1) RETURNING *';
    const { rows } = await db.query(query, [userId, exerciseId, workoutId]);
    return rows[0];
}

export async function getExercises(userId: string, workoutId: string) {
    const query = 'SELECT e.* FROM exercises e JOIN workouts w ON e.workout_id = w.id WHERE w.id = $2 AND w.user_id = $1 ORDER BY created_at ASC';
    const { rows } = await db.query(query, [userId, workoutId]);
    return rows;
}

export async function getExercise(userId: string, workoutId: string, exerciseName: string) {
    const query = 'SELECT e.* FROM exercises e JOIN workouts w on e.workout_id = w.id WHERE w.user_id = $1 AND w.id = $2 AND e.name = $3';
    const { rows } = await db.query(query, [userId, workoutId, exerciseName]);
    return rows[0];
}

export async function updateName(userId: string, exerciseId: string, exerciseName: string) {
    const query = `UPDATE exercises e SET name = $3 FROM workouts w WHERE e.id = $2 AND e.workout_id = w.id AND w.user_id = $1 RETURNING e.*`;
    const { rows } = await db.query(query, [userId, exerciseId, exerciseName]);
    return rows[0];
}

