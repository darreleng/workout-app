import { pool as db } from "../db/db";

export async function getExercises(userId: string) {
    const query = `SELECT e.id, e.name, e.created_at, s.set_number, s.reps, s.weight_kg FROM exercises e JOIN workouts w ON w.id = e.workout_id JOIN sets s ON e.id = s.exercise_id WHERE w.user_id = $1`;
    const { rows } = await db.query(query, [userId]);

    const groupedExercises = rows.reduce((acc: any[], row) => {
        let exercise = acc.find(ex => ex.id === row.id);

        if (!exercise) {
            exercise = {
                id: row.id,
                name: row.name,
                created_at: row.created_at,
                sets: []
            };
            acc.push(exercise);
        };

        exercise.sets.push({
            id: row.set_id,
            set_number: row.set_number,
            reps: row.reps,
            weight_kg: row.weight_kg
        });

        return acc;
    }, []);

    return groupedExercises;
};
