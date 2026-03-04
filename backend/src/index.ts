import express from "express";
import path from 'path';
import app from "./app";

const PORT = process.env.PORT || 3000;

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