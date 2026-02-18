import { Router } from "express";
import { getExercises } from "src/controllers/globalExerciseController";
import authMiddleware from "src/middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get('/', getExercises);

export default router;