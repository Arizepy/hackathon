import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../types/enums";
import { AppError } from "./errorHandler";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-string-replace-in-env";

export interface JWTPayload {
  sub: string;
  email: string;
  role: Role;
  stationId: string | null;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "UNAUTHORIZED", "Missing or invalid authorization token"));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      stationId: decoded.stationId,
    };
    next();
  } catch (err) {
    return next(new AppError(401, "UNAUTHORIZED", "Invalid or expired authentication token"));
  }
};

export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(403, "FORBIDDEN", "You do not have permission to access this resource")
      );
    }

    next();
  };
};

export const requireOwnStationOrRole = (...overrideRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    }

    const { id: targetStationId } = req.params;

    // Allow override roles to access any station
    if (overrideRoles.includes(req.user.role)) {
      return next();
    }

    // Allow if user is scoping their own station.
    // If request specifies 'my', map it inside the controller, but here we can check if it matches the user's stationId
    if (targetStationId === "my" || req.user.stationId === targetStationId) {
      return next();
    }

    return next(
      new AppError(403, "FORBIDDEN", "You only have access to your own station's details")
    );
  };
};
