import { Router } from "express";
import { OrdersController } from "../controllers/orders.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Open to any authenticated user
router.get("/", requireAuth, OrdersController.getCatalog);

export default router;
