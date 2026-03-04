import request from 'supertest';
import app from './app.js';
import { pool } from './db/db.js';

const userA_ID = 'D37ANAH2R0YxD9IuncVsVybnjk5vbRxN';

vi.mock('./middleware/authMiddleware', () => ({
    default: (req: any, res: any, next: any) => {
        req.user = { id: userA_ID }; 
        next();
    }
}));

describe('Exercises CRUD API', () => {
    const workoutId = '00000000-0000-0000-0000-000000000020';
    let createdExerciseId: string;

    beforeAll(async () => {
        await pool.query(
            'INSERT INTO workouts (id, name, user_id) VALUES ($1, $2, $3)', 
            [workoutId, 'CRUD Workout', userA_ID]
        );
    });

    afterAll(async () => {
        await pool.query('DELETE FROM workouts WHERE id = $1', [workoutId]);
    });
    
    it('creates an exercise and automatically creates Set 1', async () => {
        const res = await request(app)
        .post(`/api/workouts/${workoutId}/exercises`)
        .send({ exerciseName: 'Deadlift' });
        
        expect(res.status).toBe(201);
        expect(res.body.set_number).toBe(1); 
        
        createdExerciseId = res.body.exercise_id;
    });
    
    it('returns 400 if an exercise with the same name already exists in that workout', async () => {
        const res = await request(app)
            .post(`/api/workouts/${workoutId}/exercises`)
            .send({ exerciseName: 'Deadlift' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('This exercise already exists in your workout');
    });

    it('returns 400 and a validation error message if the exercise name is missing or empty', async () => {
        const res = await request(app)
            .post(`/api/workouts/${workoutId}/exercises`)
            .send({ exerciseName: "" });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Exercise name must at least be 1 character');
    });

    it('updates the exercise name', async () => {
        const res = await request(app)
            .patch(`/api/workouts/${workoutId}/exercises/${createdExerciseId}`)
            .send({ name: 'Sumo Deadlift' });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Exercise name updated');
    });

    it('deletes the exercise', async () => {
        const res = await request(app)
            .delete(`/api/workouts/${workoutId}/exercises/${createdExerciseId}`);

        expect(res.status).toBe(200);
        
        const dbCheck = await pool.query('SELECT * FROM exercises WHERE id = $1', [createdExerciseId]);
        expect(dbCheck.rows.length).toBe(0);
    });
});
