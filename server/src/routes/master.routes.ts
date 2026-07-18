import { Router } from "express";
import { MasterController } from "../controllers/master.controller";
import { requireAuth, requireRole } from "../middleware/auth";
import { Role } from "../types/enums";

const router = Router();

// Facility Hours (Open to all authenticated users)
router.get("/facilities", requireAuth, MasterController.getFacilities);

// First Aid Training
router.get("/training/modules", requireAuth, MasterController.getTrainingModules);
router.get("/training/assignments", requireAuth, MasterController.getTrainingAssignments);
router.post("/training/assignments/:id/complete", requireAuth, MasterController.completeTraining);

// Staff Shift Schedule
router.get("/shifts", requireAuth, MasterController.getShifts);

// Patient Records
router.get("/patients", requireAuth, MasterController.getPatients);
router.get("/patients/:id", requireAuth, MasterController.getPatientById);

export default router;
