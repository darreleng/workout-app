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
};

export async function getExercises(userId: string) {
    const query = `SELECT e.id, e.name, s.set_number, s.reps, s.weight_kg FROM exercises e JOIN workouts w ON w.id = e.workout_id JOIN sets s ON e.id = s.exercise_id WHERE w.user_id = $1`;
    const { rows } = await db.query(query, [userId]);

    const groupedExercises = rows.reduce((acc: any[], row) => {
        let exercise = acc.find(ex => ex.id === row.id);

        if (!exercise) {
            exercise = {
                id: row.id,
                name: row.name,
                sets: []
            };
            acc.push(exercise);
        };

        exercise.sets.push({
            id: row.set_id,
            reps: row.reps,
            weight: row.weight_kg
        });

        return acc;
    }, []);

    return groupedExercises;
};