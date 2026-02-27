import { Router } from "express";
import { getExercises } from "../controllers/globalExerciseController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get('/', getExercises);

export default router;