import { Router } from "express";
import { createSet, updateSet, deleteSet } from "../controllers/setController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router({mergeParams: true});

router.use(authMiddleware);

router.post('/', createSet);
router.patch('/:setId', updateSet);
router.delete('/:setId', deleteSet);

export default router;