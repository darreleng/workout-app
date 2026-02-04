import { Router } from "express";
import { createExercise, deleteExercise, getExercises } from "src/controllers/exerciseController";

const router = Router({mergeParams: true});

router.get('/', getExercises);
router.post('/', createExercise);
// router.patch('/:exerciseId', updateExercise);
router.delete('/:exerciseId', deleteExercise);

export default router;