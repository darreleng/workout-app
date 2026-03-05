import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SetCard from "../pages/workout/SetCard";
import { renderWithProviders as render } from './render';

describe('SetCard Component', () => {
    const defaultProps = {
        id: 'current-set-id',
        set_number: 1,
        reps: 10,
        weight_kg: 100,
        workout_id: 'workout-123',
        prevExerciseSet: {
            id: 'prev-set-id',
            set_number: 1,
            reps: 8,
            weight_kg: 95.5,
        },
        updateSetField: vi.fn(),
        deleteSet: vi.fn(),
    };

    it('displays the "PREVIOUS" data correctly', () => {
        render(<SetCard {...defaultProps} />);

        const prevDisplay = screen.getByLabelText('Previous Exercise Set Benchmark');
        expect(prevDisplay).toHaveValue('8 x 95.5 kg');
    });

    it('displays a dash when prevExerciseSet data is missing', () => {
        const propsWithoutPrev = { 
            ...defaultProps, 
            prevExerciseSet: undefined as any
        };

        render(<SetCard {...propsWithoutPrev} />);

        const prevDisplay = screen.getByLabelText('Previous Exercise Set Benchmark');
        expect(prevDisplay).toHaveValue('-');
    });

    it('allows the user to change reps', async () => {
        const user = userEvent.setup();
        render(<SetCard {...defaultProps} />);

        const repsInput = screen.getByLabelText('Reps');

        await user.clear(repsInput);
        await user.type(repsInput, '12');

        expect(repsInput).toHaveValue('12');
    });

    it('prevents the user to leave reps empty', async () => {
        const user = userEvent.setup();
        render(<SetCard {...defaultProps} />);

        const repsInput = screen.getByLabelText('Reps');

        await user.clear(repsInput);
        await user.tab();

        expect(repsInput).toBeInvalid();
    });

    it('opens a confirmation modal upon clicking the delete set button', async () => {
        const user = userEvent.setup();

        render(<SetCard {...defaultProps} />);

        const setDisplay = screen.getByLabelText('Set Number');
        await user.click(setDisplay);

        const deleteMenuItem = screen.getByRole('menuitem', { name: /delete set/i });
        await user.click(deleteMenuItem);

        expect(screen.getByText(/are you sure you want to delete this set/i)).toBeInTheDocument();

        const confirmDeleteBtn = screen.getByRole('button', { name: /^delete$/i }); 
        await user.click(confirmDeleteBtn);

        expect(defaultProps.deleteSet).toHaveBeenCalledTimes(1);
        expect(screen.queryByText(/are you sure you want to delete this set/i)).not.toBeInTheDocument();
    });

});