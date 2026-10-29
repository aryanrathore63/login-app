import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthedRequest extends Request {
  userId?: string;
}

/** Reads "Authorization: Bearer <token>" and sets req.userId if the token is valid. */
export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET as string) as { sub: string };
      req.userId = payload.sub;
    } catch {
      /* invalid/expired token -> treated as guest */
    }
  }
  next();
}
