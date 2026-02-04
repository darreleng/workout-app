import { Router } from "express";
import exerciseRouter from './exerciseRoutes';
import authMiddleware from "src/middleware/authMiddleware";
import { getAllWorkouts, createWorkout, getWorkoutWithExercisesAndSets, updateWorkoutName, deleteWorkout } from "src/controllers/workoutController";

const router = Router();

router.use(authMiddleware);

router.get('/', getAllWorkouts);
router.post('/', createWorkout);
router.get('/:workoutId', getWorkoutWithExercisesAndSets);
router.patch('/:workoutId', updateWorkoutName);
router.delete('/:workoutId', deleteWorkout);
router.use('/:workoutId/exercises', exerciseRouter);

export default router;


