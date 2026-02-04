import { Router } from "express";
import { createExercise, deleteExercise, getExercises } from "src/controllers/exerciseController";
import authMiddleware from "src/middleware/authMiddleware";
import setRouter from './setRoutes';

const router = Router({mergeParams: true});

router.use(authMiddleware);

router.get('/', getExercises);
router.post('/', createExercise);
// router.patch('/:exerciseId', updateExercise);
router.delete('/:exerciseId', deleteExercise);
router.use('/:exerciseId/sets', setRouter)

export default router;