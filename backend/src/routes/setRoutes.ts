import { Router } from "express";
import { createSet } from "src/controllers/setController";
import authMiddleware from "src/middleware/authMiddleware";

const router = Router({mergeParams: true});

router.use(authMiddleware);

router.post('/', createSet);
// router.patch('/:exerciseId', updateExercise);
// router.delete('/:exerciseId', deleteExercise);

export default router;