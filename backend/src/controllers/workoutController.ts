import * as WorkoutModel from "../models/workoutModel";
import { Request, Response } from "express";
import { WorkoutNameSchema } from "../../../shared/schemas";

export async function createWorkout(req: Request, res: Response) {
    try {
        const { id } = req.user!;
        const { workoutName } = req.body;
        const newWorkout = await WorkoutModel.createWorkout(id, workoutName);
        res.status(201).json(newWorkout)
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getAllWorkouts(req: Request, res: Response) {
    try {
        const userId = req.user!.id;       
        const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : null;
        const workouts = await WorkoutModel.getAllWorkouts(userId, cursor);
        res.status(200).json(workouts);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getWorkoutWithExercisesAndSets(req: Request, res: Response) {
    try {
        const { workoutId } = req.params;
        const userId = req.user!.id;
        const workout = await WorkoutModel.getWorkoutWithExercisesAndSets(userId, workoutId as string);
        if (!workout) return res.status(404).json({ message: "Workout not found or unauthorised" });
        res.status(200).json(workout);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteWorkout(req: Request, res: Response) {
    try {       
        const { workoutId } = req.params;
        const userId = req.user!.id;
        const deletedWorkout = await WorkoutModel.deleteWorkout(userId, workoutId as string);
        if (!deletedWorkout) return res.status(404).json({ message: "Workout not found or unauthorised" });
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateWorkout(req: Request, res: Response) {
    try {
        const userId = req.user!.id;
        const { workoutId } = req.params;

        if (!req.body) {
            const updatedWorkout = await WorkoutModel.completeWorkout(userId, workoutId as string);
            return res.status(200).json(updatedWorkout);
        }

        const updateData: { name?: string; notes?: string } = {};
        

        if (req.body.name) {
            const result = WorkoutNameSchema.safeParse(req.body);
            if (!result.success) return res.status(400).json({ message: result.error.issues[0].message });
            updateData.name = result.data.name;
        }

        if ('notes' in req.body) updateData.notes = req.body.notes;

        const updatedWorkout = await WorkoutModel.updateWorkout(userId, workoutId as string, updateData);
        if (!updatedWorkout) return res.status(404).json({ message: "Workout not found or unauthorized" });
        return res.status(200).json(updatedWorkout);

    } catch (error) {
        console.error(error);
        res.status(500).json( { message: "Internal server error" });
    }
}

export async function getStats(req: Request, res: Response) {
    try {
        const userId = req.user!.id;       
        const stats = await WorkoutModel.getStats(userId);
        res.status(200).json(stats);
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getActive(req: Request, res: Response) {
    try {
        const userId = req.user!.id;       
        const stats = await WorkoutModel.getActive(userId);
        res.status(200).json(stats);
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" });
    }
}