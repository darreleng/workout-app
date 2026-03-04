import request from 'supertest';
import app from './app.js';
import { pool } from './db/db.js';
import { createSet } from './models/setModel.js';

const userA_ID = 'D37ANAH2R0YxD9IuncVsVybnjk5vbRxN';
const exerciseName = 'Deadlift';

vi.mock('./middleware/authMiddleware', () => ({
    default: (req: any, res: any, next: any) => {
        req.user = { id: userA_ID }; 
        next();
    }
}));

describe('Set API Integration', () => {
    const workoutId = '00000000-0000-0000-0000-000000000020';
    let exerciseId: string;
    let setId: string;

    beforeAll(async () => {
        await pool.query(
            'INSERT INTO workouts (id, name, user_id) VALUES ($1, $2, $3)', 
            [workoutId, 'CRUD Workout', userA_ID]
        );
        await request(app)
            .post(`/api/workouts/${workoutId}/exercises`)
            .send({ exerciseName: exerciseName });
        exerciseId = (await pool.query(`SELECT id FROM exercises WHERE name = $1`, [exerciseName])).rows[0].id;
        setId = (await pool.query(`SELECT id FROM sets WHERE exercise_id = $1`, [exerciseId])).rows[0].id;
    });

    afterAll(async () => {
        await pool.query('DELETE FROM workouts WHERE id = $1', [workoutId]);
    });

    it('returns 400 when reps are decimals', async () => {
        const res = await request(app)
            .patch(`/api/workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}`)
            .send({ reps: 10.5 });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/invalid input/i);
    });

    it('returns 200 when weight is a decimal', async () => {
        const res = await request(app)
            .patch(`/api/workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}`)
            .send({ weight_kg: 22.5 });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Set updated');
    });

    it('auto-reindexes remaining sets when a middle set is deleted', async () => {
        const set2 = await createSet(userA_ID, exerciseId);
        const set3 = await createSet(userA_ID, exerciseId);

        await request(app).delete(`/api/workouts/${workoutId}/exercises/${exerciseId}/sets/${set2.id}`);

        const { rows } = await pool.query(
            'SELECT id, set_number FROM sets WHERE exercise_id = $1 ORDER BY set_number ASC',
            [exerciseId]
        );

        expect(rows.length).toBe(2);
        expect(rows[0].set_number).toBe(1);
        expect(rows[1].id).toBe(set3.id); 
        expect(rows[1].set_number).toBe(2);
    });

    it('returns all exercises across history for frontend "Previous" calculation', async () => {
        const workoutIds = {
            old: '00000000-0000-0000-0000-000000000040',
            older: '00000000-0000-0000-0000-000000000060'
        };

        const exName = 'Bench Press';

        try {
            await setupHistoricalWorkout(workoutIds.older, 'Older Workout', '2 days', [
                { name: exName, reps: 12, weight: 110 },
                { name: 'Squats', reps: 12, weight: 210 }
            ]);

            await setupHistoricalWorkout(workoutIds.old, 'Old Workout', '1 day', [
                { name: exName, reps: 10, weight: 100 },
                { name: 'Squats', reps: 12, weight: 200 }
            ]);

            const res = await request(app).get('/api/exercises');

            const filtered = res.body
                .filter((ex: any) => ex.name === exName)
                .sort((a: any, b: any) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );

            expect(filtered.length).toBe(2);
            expect(Number(filtered[0].sets[0].weight_kg)).toBe(100); 
            expect(new Date(filtered[0].created_at).getTime()).toBeGreaterThan(new Date(filtered[1].created_at).getTime());

        } finally {
            await pool.query('DELETE FROM workouts WHERE id IN ($1, $2)', [workoutIds.old, workoutIds.older]);
        }
    });

});

async function setupHistoricalWorkout(id: string, name: string, interval: string, exercises: {name: string, reps: number, weight: number}[]) {
    await pool.query(
        `INSERT INTO workouts (id, user_id, name, created_at, completed_at) 
        VALUES ($1, $2, $3, NOW() - $4::interval, NOW() - $4::interval)`,
        [id, userA_ID, name, interval]
    );

    for (const ex of exercises) {
        const res = await pool.query(
            `INSERT INTO exercises (name, workout_id, created_at) 
            VALUES ($1, $2, NOW() - $3::interval) RETURNING id`, 
            [ex.name, id, interval]
        );
        await pool.query(
            "INSERT INTO sets (exercise_id, set_number, reps, weight_kg) VALUES ($1, 1, $2, $3)", 
            [res.rows[0].id, ex.reps, ex.weight]
        );
    }
}