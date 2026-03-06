import { http, HttpResponse } from 'msw';

export const handlers = [
    http.get('/api/exercises', () => {
        return HttpResponse.json([
            {
                id: 'past-ex-1',
                name: 'Bench Press',
                created_at: '2023-01-01T10:00:00Z',
                workout_id: 'old-workout-1',
                sets: [
                { id: 'old-s1', set_number: 1, reps: 10, weight_kg: 60 }
                ]
            },
            {
                id: 'past-ex-2',
                name: 'Bench Press',
                created_at: '2023-02-01T10:00:00Z',
                workout_id: 'old-workout-2',
                sets: [
                { id: 'older-s1', set_number: 1, reps: 10, weight_kg: 65 }
                ]
            },
            {
                id: 'current-ex',
                name: 'Bench Press',
                created_at: '2026-03-05T10:00:00Z',
                sets: []
            },
        ]);
    }),
    http.patch('/api/workouts/:workoutId/exercises/:exerciseId', async ({ request }) => {
        const body = await request.json() as { name: string };
        if (!body.name || body.name.length < 1) {
            return HttpResponse.json({ status: 400 });
        }
        return HttpResponse.json({ name: body.name }, { status: 200 });
    }),
    http.delete('/api/workouts/:workoutId/exercises/:exerciseId/sets/:setId', ({ params }) => {
        return HttpResponse.json({ status: 200 });
    }),
];