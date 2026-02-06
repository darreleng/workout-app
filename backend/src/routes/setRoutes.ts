import { Router } from "express";
import { createSet, updateSet, deleteSet } from "src/controllers/setController";
import authMiddleware from "src/middleware/authMiddleware";

const router = Router({mergeParams: true});

router.use(authMiddleware);

router.post('/', createSet);
router.patch('/:setId', updateSet);
router.delete('/:setId', deleteSet);

export default router;