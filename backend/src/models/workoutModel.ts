import { pool as db } from "src/db/db";
import { getExercises } from "./exerciseModel";
import { getSets } from "./setModel";

export async function getAllWorkouts(userId: string, cursor: string | null) {
    const limit = 10;
    const startingId = (cursor) ? cursor : 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    const query = 
        `SELECT 
            w.*, 
            COALESCE(SUM(s.weight_kg * s.reps), 0) AS workout_total_volume 
        FROM workouts w 
        LEFT JOIN exercises e ON w.id = e.workout_id
        LEFT JOIN sets s ON e.id = s.exercise_id
        WHERE w.user_id = $1 AND w.id < $2 
        GROUP BY w.id 
        ORDER BY w.id DESC 
        LIMIT $3`;
    const { rows } = await db.query(query, [userId, startingId, limit + 1]);

    const hasNextPage = rows.length > limit;
    const itemsToReturn = hasNextPage ? rows.slice(0, -1) : rows;
    const nextCursor = hasNextPage ? itemsToReturn[itemsToReturn.length - 1].id : null;
    
    return { itemsToReturn, nextCursor };
}

export async function getStats(userId: string) {
    const query = 
        `SELECT 
            COUNT(w.id) AS total_workouts,
            SUM(s.weight_kg * s.reps) AS total_volume,
            SUM(EXTRACT(EPOCH FROM (w.completed_at - w.created_at)) / 3600) AS total_hours
        FROM workouts w
        LEFT JOIN exercises e ON w.id = e.workout_id
        LEFT JOIN sets s ON e.id = s.exercise_id
        WHERE w.user_id = $1 AND w.completed_at IS NOT NULL`;
    const { rows } = await db.query(query, [userId]);
    return rows[0]
}

export async function getActive(userId: string) {
    const query = `SELECT id, name, created_at FROM workouts WHERE user_id = $1 AND completed_at IS NULL ORDER BY created_at DESC`;
    const { rows } = await db.query(query, [userId]);
    return rows[0]
}

export async function createWorkout(userId: string, workoutName: string) {
    const query = 'INSERT INTO workouts (user_id, name) VALUES ($1, $2) RETURNING *';
    const { rows } = await db.query(query, [userId, workoutName]);
    return rows[0];
}

export async function getWorkout(userId: string, workoutId: string) {
    const query = 'SELECT * FROM workouts WHERE id = $2 AND user_id = $1';
    const { rows } = await db.query(query, [userId, workoutId]);
    return rows[0];
};

export async function getWorkoutWithExercisesAndSets(userId: string, workoutId: string) {
    // TODO: refactor 3 queries into 1 join mega query
    const workout = await getWorkout(userId, workoutId);
    if (!workout) return null;
    const allExercises = await getExercises(userId, workoutId);
    const allSets = await getSets(userId, workoutId);

    const exercisesWithSets = allExercises.map(exercise => {
        return {
            ...exercise,
            sets: allSets.filter(sets => sets.exercise_id === exercise.id)
        }
    })
    return {
        ...workout,
        exercises: exercisesWithSets
    }
}

export async function deleteWorkout(userId: string, workoutId: string) {
    const query = 'DELETE FROM workouts WHERE id = $2 AND user_id = $1 RETURNING *';
    const { rows } = await db.query(query, [userId, workoutId]);
    return rows[0];
};

export async function updateWorkout(userId: string, workoutId: string, field: { name?: string, notes?: string }) {
    const query = 
        `UPDATE workouts SET 
            name = COALESCE($3, name), 
            notes = COALESCE($4, notes)
        WHERE id = $2 AND user_id = $1
        RETURNING *`;
    const values = [userId, workoutId, field.name ?? null, field.notes ?? null ];
    const { rows } = await db.query(query, values);
    return rows[0]; 
}

export async function completeWorkout(userId: string, workoutId: string) {
    const query = 
        `UPDATE workouts SET 
            completed_at = NOW(),
            duration_seconds = EXTRACT(EPOCH FROM (NOW() - created_at))
        WHERE id = $2 AND user_id = $1
        RETURNING *`;
    const values = [userId, workoutId];
    const { rows } = await db.query(query, values);
    return rows[0]; 
}