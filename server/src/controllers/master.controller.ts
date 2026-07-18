import { Request, Response, NextFunction } from "express";
import { MasterService } from "../services/masterService";

export class MasterController {
  // 1. GET /api/facilities
  static async getFacilities(req: Request, res: Response, next: NextFunction) {
    try {
      const facilities = await MasterService.getFacilities();
      return res.status(200).json(facilities);
    } catch (err) {
      next(err);
    }
  }

  // 2. GET /api/training/modules
  static async getTrainingModules(req: Request, res: Response, next: NextFunction) {
    try {
      const modules = await MasterService.getTrainingModules();
      return res.status(200).json(modules);
    } catch (err) {
      next(err);
    }
  }

  // 3. GET /api/training/assignments
  static async getTrainingAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const assignments = await MasterService.getTrainingAssignments();
      return res.status(200).json(assignments);
    } catch (err) {
      next(err);
    }
  }

  // 4. POST /api/training/assignments/:id/complete
  static async completeTraining(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await MasterService.completeTrainingAssignment(id);
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  // 5. GET /api/shifts
  static async getShifts(req: Request, res: Response, next: NextFunction) {
    try {
      const shifts = await MasterService.getShifts();
      return res.status(200).json(shifts);
    } catch (err) {
      next(err);
    }
  }

  // 6. GET /api/patients
  static async getPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const patients = await MasterService.getPatients(search);
      return res.status(200).json(patients);
    } catch (err) {
      next(err);
    }
  }

  // 7. GET /api/patients/:id
  static async getPatientById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const patient = await MasterService.getPatientById(id);
      return res.status(200).json(patient);
    } catch (err) {
      next(err);
    }
  }
}
