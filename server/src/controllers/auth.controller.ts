import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import { loginSchema } from "../validation/schemas";

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await AuthService.login(validated.email, validated.password);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
      }
      const user = await AuthService.getMe(req.user.id);
      return res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }
}
