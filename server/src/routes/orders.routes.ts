import { Router } from "express";
import { OrdersController } from "../controllers/orders.controller";
import { requireAuth, requireOwnStationOrRole, requireRole } from "../middleware/auth";
import { Role } from "../types/enums";

const router = Router();

// National Orders queue (Pharmacy only)
router.get("/", requireAuth, requireRole(Role.PHARMACY), OrdersController.getOrdersQueue);

// State-changing orders endpoints (Pharmacy only)
router.post("/:id/approve", requireAuth, requireRole(Role.PHARMACY), OrdersController.approveOrder);
router.post("/:id/reject", requireAuth, requireRole(Role.PHARMACY), OrdersController.rejectOrder);
router.post("/:id/dispatch", requireAuth, requireRole(Role.PHARMACY), OrdersController.dispatchOrder);

// Deliver order (Requires Nurse/Doctor/Supervisor at the station)
router.post(
  "/:id/deliver",
  requireAuth,
  requireOwnStationOrRole(Role.SUPERVISOR),
  OrdersController.deliverOrder
);

// Station-scoped order endpoints
router.post(
  "/station/:id",
  requireAuth,
  requireOwnStationOrRole(Role.SUPERVISOR),
  OrdersController.createOrder
);

router.get(
  "/station/:id",
  requireAuth,
  requireOwnStationOrRole(Role.SUPERVISOR, Role.PHARMACY),
  OrdersController.getStationOrders
);

router.get(
  "/station/:id/suggested",
  requireAuth,
  requireOwnStationOrRole(Role.SUPERVISOR),
  OrdersController.getSuggestedOrder
);

export default router;
