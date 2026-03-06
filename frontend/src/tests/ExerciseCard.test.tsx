import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders as render } from './render';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import  ExerciseCard from '../pages/workout/ExerciseCard';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

const mockExercise = {
    id: 'current-ex-123',
    name: 'Bench Press',
    created_at: new Date().toISOString(),
    workout_id: 'workout-abc',
    sets: [
        { id: 'set-1', set_number: 1, reps: 8, weight_kg: 70 }
    ]
};

describe('ExerciseCard', () => {
    it('renders the exercise name and its sets after loading', async () => {
        const queryClient = createTestQueryClient();
        
        render(
            <QueryClientProvider client={queryClient}>
                <ExerciseCard {...mockExercise} />
            </QueryClientProvider>
        );

        const nameInput = await screen.findByDisplayValue('Bench Press');
        expect(nameInput).toBeInTheDocument();
        
        const setDisplay = screen.getByLabelText('Set Number');
        expect(setDisplay).toHaveValue('1')

        const prevDisplay = screen.getByLabelText('Previous Exercise Set Benchmark');
        expect(prevDisplay).toHaveValue('10 x 65 kg');

        const repsInput = screen.getByLabelText('Reps');
        expect(repsInput).toHaveValue('8')

        const weightInput = screen.getByLabelText('Weight (kg)');
        expect(weightInput).toHaveValue('70')
    });

    it('updates the exercise name on blur', async () => {
        const user = userEvent.setup();
        const queryClient = createTestQueryClient();
        
        render(
            <QueryClientProvider client={queryClient}>
                <ExerciseCard {...mockExercise} />
            </QueryClientProvider>
        );

        const nameInput = await screen.findByDisplayValue('Bench Press');

        await user.clear(nameInput);
        await user.type(nameInput, 'Incline Bench Press');
        await user.tab();

        expect(nameInput).toHaveValue('Incline Bench Press');
    });

    it('does not update the exercise name if it is empty on blur (validation fails)', async () => {
        const user = userEvent.setup();
        const fetchSpy = vi.spyOn(window, 'fetch');
        
        render(
            <QueryClientProvider client={createTestQueryClient()}>
                <ExerciseCard {...mockExercise} />
            </QueryClientProvider>
        );

        const nameInput = await screen.findByDisplayValue('Bench Press');

        await user.clear(nameInput);
        await user.tab(); 

        expect(fetchSpy).not.toHaveBeenCalledWith(
            expect.stringContaining('/api/workouts/workout-abc/exercises/current-ex-123'),
            expect.objectContaining({ method: 'PATCH' })
        );
    });

    it('calls the delete mutation with the right set id when a set delete button is clicked', async () => {
        const user = userEvent.setup();
        const queryClient = createTestQueryClient();
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
        
        let capturedSetId: string;
        server.use(
            http.delete('/api/workouts/:workoutId/exercises/:exerciseId/sets/:setId', ({ params }) => {
                capturedSetId = params.setId as string;
                return HttpResponse.json({ status: 200 });
            })
        );
        
        render(
            <QueryClientProvider client={queryClient}>
                <ExerciseCard {...mockExercise} />
            </QueryClientProvider>
        );
        
        await screen.findByLabelText('Set Number')
        await user.click(screen.getByLabelText('Set Number'));
        await user.click(screen.getByRole('menuitem', { name: /delete set/i }));
        await user.click(screen.getByRole('button', { name: /^delete$/i }));

        waitFor(() => {
            expect(capturedSetId).toBe(mockExercise.sets[0].id);
        })

        expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['exercises'] }));
        expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['workouts', mockExercise.workout_id] }));

    });
});