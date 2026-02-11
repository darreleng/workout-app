import { Router } from "express";
import { getExerciseHistory } from "src/controllers/globalExerciseController";
import authMiddleware from "src/middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get('/history', getExerciseHistory);

export default router;