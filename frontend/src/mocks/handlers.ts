import { http, HttpResponse } from 'msw';

export const handlers = [
    http.delete('/api/workouts/:workoutId/exercises/:exerciseId/sets/:setId', ({ params }) => {
        console.log(`MSW: Intercepted DELETE for set ${params.setId}`);
        return HttpResponse.json({ message: 'Set deleted successfully' }, { status: 200 });
    }),
    // http.get('/api/exercises', () => {
    //   return HttpResponse.json([
    //     {
    //       id: 'ex-1',
    //       name: 'Bench Press',
    //       created_at: new Date().toISOString(),
    //       sets: [{ id: 's1', set_number: 1, reps: 10, weight_kg: 100 }]
    //     },
    //     {
    //       id: 'ex-0',
    //       name: 'Bench Press',
    //       created_at: new Date(Date.now() - 86400000).toISOString(),
    //       sets: [{ id: 's0', set_number: 1, reps: 8, weight_kg: 90 }]
    //     }
    //   ]);
    // }),
];