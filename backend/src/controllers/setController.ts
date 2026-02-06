import * as SetModel from "src/models/setModel";
import { Request, Response } from "express";

export async function createSet(req: Request, res: Response) {
    try {
        const { exerciseId } = req.params;
        const userId = req.user!.id;
        const newSet = await SetModel.createSet(userId, exerciseId as string);
        if (!newSet) return res.status(403).json({ message: "You don't own this exercise."});
        res.status(201).json(newSet);
    } catch (error) {
        console.error(error);
        res.status(500).json( { message: "Internal server error" });
    }
}

export async function updateSet(req: Request, res: Response) {
    try {
        const userId = req.user!.id;
        const { setId } = req.params;
        const field = req.body;
        const updatedSet = await SetModel.updateSet(userId, setId as string, field); 
        if (!updatedSet) return res.status(403).json({ message: "You don't own this set."}); 
        res.status(201).json({ message: 'Set updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json( { message: "Internal server error" });
    }
}

export async function deleteSet(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { setId } = req.params;
    await SetModel.deleteSet(userId, setId as string);
    res.status(200).json({ message: "Set deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}