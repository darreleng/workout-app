import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import cors from 'cors';
import workoutRoutes from './routes/workoutRoutes';
import globalExerciseRoutes from "./routes/globalExerciseRoutes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], 
    credentials: true, 
  })
);

app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', globalExerciseRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});