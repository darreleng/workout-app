import { SetSchema } from "@shared/schemas";
import * as SetModel from "src/models/setModel";
import { Request, Response } from "express";

export async function createSet(req: Request, res: Response) {
    try {
        const result = SetSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ errors: result.error.issues[0].message });
        const userId = req.user!.id;
        const newExercise = await SetModel.createSet(userId, {...result.data});
        if (!newExercise) return res.status(403).json({ message: "You don't own this exercise."});
        res.status(201).json(newExercise);
    } catch (error) {
        console.error(error);
        res.status(500).json( { message: "Internal server error" });
    }
}
