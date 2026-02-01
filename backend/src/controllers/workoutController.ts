import * as WorkoutModel from "src/models/workoutModel";
import { Request, Response } from "express";
import { WorkoutSchema, WorkoutWithExercisesSchema } from "@shared/workoutSchema.js";

export async function createWorkoutWithExercises(req: Request, res: Response) {
    try {
        const result = WorkoutWithExercisesSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ message: "Validation failed", errors: result.error.issues });

        const { name, exercises } = result.data;
        const userId = req.user!.id; 

        const newWorkout = await WorkoutModel.createWorkoutWithExercises(userId, name, exercises);
        res.status(201).json(newWorkout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Could not create workout" });
    }
}

export async function getAllWorkouts(req: Request, res: Response) {
    try {
        const { id } = req.user!;       
        const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : null;
        const workouts = await WorkoutModel.getAllWorkouts(id, cursor);
        res.status(200).json(workouts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
}

export async function getWorkout(req: Request, res: Response) {
    try {
        const { workoutId } = req.params;
        const userId = req.user!.id;
        const workout = await WorkoutModel.getWorkout(userId, workoutId as string);
        res.status(200).json(workout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
}

export async function deleteWorkout(req: Request, res: Response) {
    try {       
        const { workoutId } = req.params;
        const userId = req.user!.id;
        
        const deletedWorkout = await WorkoutModel.deleteWorkout(userId, workoutId as string);

        if (!deletedWorkout) return res.status(404).json({ message: "Workout not found or unauthorised." });

        res.status(200).json({ message: "Workout deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
}

export async function updateWorkoutName(req: Request, res: Response) {
    try {
        const result = WorkoutSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ errors: result.error.issues });

        const { workoutId } = req.params;
        const { name } = result.data;
        const userId = req.user!.id;

        const updatedWorkout = await WorkoutModel.updateWorkoutName(userId, workoutId as string, name);
        
        if (!updatedWorkout) return res.status(404).json({ message: "Workout not found or unauthorised." });

        res.status(200).json(updatedWorkout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
}

