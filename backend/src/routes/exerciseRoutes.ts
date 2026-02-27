import { Router } from "express";
import { createExercise, deleteExercise, getExercises, updateName } from "../controllers/exerciseController";
import authMiddleware from "../middleware/authMiddleware";
import setRouter from './setRoutes';

const router = Router({mergeParams: true});

router.use(authMiddleware);

router.get('/', getExercises);
router.post('/', createExercise);
router.patch('/:exerciseId', updateName);
router.delete('/:exerciseId', deleteExercise);
router.use('/:exerciseId/sets', setRouter);

export default router;