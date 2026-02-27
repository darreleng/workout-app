import express from "express";
import path from 'path';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import cors from 'cors';
import workoutRoutes from './routes/workoutRoutes';
import globalExerciseRoutes from "./routes/globalExerciseRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173", 
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], 
        credentials: true, 
    })
);

app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', globalExerciseRoutes);

if (process.env.NODE_ENV === 'production') {
    const root = path.join(__dirname, '../../../../frontend/dist');
    app.use(express.static(root));
    app.get('/{*splat}', (req, res) => {
        res.sendFile(path.join(root, 'index.html'));
    });
}

app.listen(PORT as number, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});