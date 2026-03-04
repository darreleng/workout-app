import request from 'supertest';
import app from './app.js';
import { pool } from './db/db.js';

const userA_ID = 'D37ANAH2R0YxD9IuncVsVybnjk5vbRxN';
const userB_ID = '5Apj3rthQWcf7UAzhabtBz64IlFesKkA';

vi.mock('./middleware/authMiddleware', () => ({
    default: (req: any, res: any, next: any) => {
        req.user = { id: userA_ID }; 
        next();
    }
}));

describe('User Workouts CRUD API', () => {
    let createdWorkoutId: string;

    afterAll(async () => {
        if (createdWorkoutId) {
            await pool.query('DELETE FROM workouts WHERE id = $1', [createdWorkoutId]);
        }
    });

    it('creates a new workout for the logged-in user', async () => {
        const response = await request(app)
            .post('/api/workouts')
            .send({ workoutName: 'Full Body'});

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');

        createdWorkoutId = response.body.id;
    });

    it('prevents creating a new workout if there is an ongoing workout', async () => {
        const response = await request(app)
            .post('/api/workouts')
            .send({ workoutName: 'Legs'});

        expect(response.status).toBe(409);
        expect(response.body.message).toContain('You already have an active workout session');
    })

    it('gets the specific workout details', async () => {
        const response = await request(app)
            .get(`/api/workouts/${createdWorkoutId}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(createdWorkoutId);
        expect(response.body).toBeTypeOf('object')
    });

    it('updates the workout name', async () => {
        const response = await request(app)
            .patch(`/api/workouts/${createdWorkoutId}`)
            .send({ name: 'Arms & Abs' });

        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Arms & Abs');
    });

    it('deletes the workout', async () => {
        const response = await request(app)
            .delete(`/api/workouts/${createdWorkoutId}`);

        expect(response.status).toBe(204);

        const dbCheck = await pool.query('SELECT * FROM workouts WHERE id = $1', [createdWorkoutId]);
        expect(dbCheck.rows.length).toBe(0);
    });
});

describe('Cross-User Data Protection', () => {
    let userB_WorkoutId: string;

    beforeAll(async () => {
        const res = await pool.query(
            'INSERT INTO workouts (name, user_id) VALUES ($1, $2) RETURNING id',
            ['User B Private Workout', userB_ID]
        );
        userB_WorkoutId = res.rows[0].id;
    });

    afterAll(async () => {
        await pool.query('DELETE FROM workouts WHERE id = $1', [userB_WorkoutId]);
    });

    it(`returns 404 with a message containing unauthorised when User A tries to view User B's workout`, async () => {
        const res = await request(app).get(`/api/workouts/${userB_WorkoutId}`);
        expect(res.status).toBe(404);
        expect(res.body.message).toContain('unauthorised');
    });

    it(`returns 404 with a message containing unauthorised when User A tries to edit User B's workout`, async () => {
        const res = await request(app)
            .patch(`/api/workouts/${userB_WorkoutId}`)
            .send({ name: `User B's Not-So-Private Workout`});
        expect(res.status).toBe(404);
        expect(res.body.message).toContain('unauthorised');
    });

    it(`returns 404 with a message containing unauthorised when User A tries to delete User B's workout`, async () => {
        const res = await request(app).delete(`/api/workouts/${userB_WorkoutId}`);
        expect(res.status).toBe(404);
        expect(res.body.message).toContain('unauthorised');
    });
});
