import { auth } from "../auth";
import { fromNodeHeaders } from "better-auth/node";
import { Request, Response, NextFunction } from "express";

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  req.user = session.user;

  next();
};