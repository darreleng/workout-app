import { ExerciseNameSchema } from "@shared/schemas";
import * as ExerciseModel from "src/models/exerciseModel";
import { Request, Response } from "express";

export async function getExercises(req: Request, res: Response) {
    try {
        const { workoutId } = req.params;
        const userId = req.user!.id;
        const exercises = await ExerciseModel.getExercises(userId, workoutId as string);
        res.status(200).json(exercises);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
}

export async function deleteExercise(req: Request, res: Response) {
    try {
        const { exerciseId, workoutId } = req.params;
        const userId = req.user!.id;
        const deletedExercise = await ExerciseModel.deleteExercise(userId, exerciseId as string, workoutId as string);
        if (!deletedExercise) return res.status(404).json({ message: "Exercise not found or unauthorised" });
        res.status(200).json({ message: "Exercise deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function createExercise(req: Request, res: Response) {
    try {
        const result = ExerciseNameSchema.safeParse(req.body.exerciseName);
        if (!result.success) return res.status(400).json({ message: result.error.issues[0].message });
        const { workoutId } = req.params;
        const userId = req.user!.id;
        const existingExercise = await ExerciseModel.getExercise(userId, workoutId as string, result.data);
        if (existingExercise) return res.status(400).json({ message: 'This exercise already exists in your workout' });
        const newExercise = await ExerciseModel.createExercise(userId, workoutId as string, result.data);
        if (!newExercise) return res.status(403).json({ message: "You don't own this workout" });
        res.status(201).json(newExercise);
    } catch (error) {
        console.error(error);
        res.status(500).json( { message: "Internal server error" });
    }
}

export async function updateName(req: Request, res: Response) {
    try {
        const userId = req.user!.id;
        const { exerciseId } = req.params;
        const { name } = req.body;
        const result = ExerciseNameSchema.safeParse(name);
        if (!result.success) return res.status(400).json({ message: result.error.issues[0].message });
        const updatedSet = await ExerciseModel.updateName(userId, exerciseId as string, result.data); 
        if (!updatedSet) return res.status(403).json({ message: "You don't own this exercise"}); 
        res.status(200).json({ message: 'Exercise name updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json( { message: "Internal server error" });
    }
}
