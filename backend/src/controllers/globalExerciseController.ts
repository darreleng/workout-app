import { Request, Response } from "express";
import * as globalExerciseModel from "../models/globalExerciseModel";

export async function getExercises(req: Request, res: Response) {
    try {
        const userId = req.user!.id;
        const exercises = await globalExerciseModel.getExercises(userId);
        res.status(200).json(exercises);
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" });
    }
}

