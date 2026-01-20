import { pool as db } from "src/db/db";
import { createExercise } from "./exerciseModel";
import { ExerciseInput } from "@shared/workoutSchema";

export async function getAllWorkouts(userId: string) {
    const query = 'SELECT * FROM workouts WHERE user_id = $1 ORDER BY created_at ASC';
    const { rows } = await db.query(query, [userId]);
    return rows;
}

export async function createWorkoutWithExercises(userId: string, name: string, exercises: ExerciseInput[]) {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const workoutSql = 'INSERT INTO workouts (user_id, name) VALUES ($1, $2) RETURNING id';
        const workoutRes = await client.query(workoutSql, [userId, name]);
        const workoutId = workoutRes.rows[0].id;

        for (const exercise of exercises) {
            await createExercise(
                userId,
                workoutId,
                exercise,
                client
            )
        };

        await client.query('COMMIT');
        return { workoutId, name };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export async function getWorkout(userId:string, workoutId: string) {
    const query = 'SELECT * FROM workouts WHERE id = $1 AND user_id = $2';
    const { rows } = await db.query(query, [workoutId, userId]);
    return rows[0];
};

export async function deleteWorkout(userId:string, workoutId: string) {
    const query = 'DELETE FROM workouts WHERE id = $1 AND user_id = $2';
    const { rows } = await db.query(query, [workoutId, userId]);
    return rows[0];
};

export async function updateWorkoutName(userId:string, workoutId: string, name: string) {
    const query = 'UPDATE workouts SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *';
    const { rows } = await db.query(query, [name, workoutId, userId]);
    return rows[0];
}