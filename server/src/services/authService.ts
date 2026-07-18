import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../db/client";
import { AppError } from "../middleware/errorHandler";
import { Role } from "../types/enums";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-string-replace-in-env";

export class AuthService {
  static async login(email: string, password: string) {
    if (!email || !password) {
      throw new AppError(400, "BAD_REQUEST", "Email and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { station: true },
    });

    if (!user) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        stationId: user.stationId,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        stationId: user.stationId,
        stationName: user.station?.name || null,
      },
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        stationId: true,
        station: {
          select: {
            name: true,
            kind: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, "NOT_FOUND", "User not found");
    }

    return user;
  }
}
