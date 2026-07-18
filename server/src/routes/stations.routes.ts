import { Router } from "express";
import { StationsController } from "../controllers/stations.controller";
import { requireAuth, requireOwnStationOrRole, requireRole } from "../middleware/auth";
import { Role } from "../types/enums";

const router = Router();

// Get list of stations (scoped by role inside the controller)
router.get("/", requireAuth, StationsController.listStations);

// Station details + items
router.get(
  "/:id",
  requireAuth,
  requireOwnStationOrRole(Role.SUPERVISOR, Role.PHARMACY),
  StationsController.getStationDetail
);

router.get(
  "/:id/items",
  requireAuth,
  requireOwnStationOrRole(Role.SUPERVISOR, Role.PHARMACY),
  StationsController.getStationItems
);

// Adjust stock qty (requires own station or Supervisor override)
router.patch(
  "/:id/items/:itemId",
  requireAuth,
  requireOwnStationOrRole(Role.SUPERVISOR),
  StationsController.adjustStock
);

// Analytics summaries, top-selling, runway projections
router.get(
  "/:id/summary",
  requireAuth,
  requireOwnStationOrRole(Role.SUPERVISOR, Role.PHARMACY),
  StationsController.getSummary
);

router.get(
  "/:id/top-medicines",
  requireAuth,
  requireOwnStationOrRole(Role.SUPERVISOR, Role.PHARMACY),
  StationsController.getTopMedicines
);

router.get(
  "/:id/stock-duration",
  requireAuth,
  requireOwnStationOrRole(Role.SUPERVISOR, Role.PHARMACY),
  StationsController.getStockDuration
);

// Restock requests
router.post(
  "/:id/restock-requests",
  requireAuth,
  requireOwnStationOrRole(Role.SUPERVISOR),
  StationsController.createRestockRequest
);

router.get(
  "/:id/restock-requests",
  requireAuth,
  requireOwnStationOrRole(Role.SUPERVISOR),
  StationsController.getRestockHistory
);

export default router;
