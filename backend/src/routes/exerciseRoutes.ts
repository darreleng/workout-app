import { Router } from "express";
import { updateExercise, createExercise, deleteExercise, getAllExercises } from "src/controllers/exerciseController";

const router = Router({mergeParams: true});

router.get('/', getAllExercises);
router.post('/', createExercise);
router.patch('/:exerciseId', updateExercise);
router.delete('/:exerciseId', deleteExercise);

export default router;