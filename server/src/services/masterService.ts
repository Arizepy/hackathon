import prisma from "../db/client";
import { AppError } from "../middleware/errorHandler";

export class MasterService {
  // 1. Facilities
  static async getFacilities() {
    return prisma.facility.findMany({
      orderBy: { name: "asc" },
    });
  }

  // 2. Training Modules
  static async getTrainingModules() {
    return prisma.trainingModule.findMany({
      orderBy: { title: "asc" },
    });
  }

  static async getTrainingAssignments() {
    return prisma.trainingAssignment.findMany({
      orderBy: { id: "asc" },
    });
  }

  static async completeTrainingAssignment(id: number) {
    const assignment = await prisma.trainingAssignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new AppError(404, "NOT_FOUND", "Training assignment not found");
    }

    return prisma.trainingAssignment.update({
      where: { id },
      data: { status: "completed" }, // mark as completed
    });
  }

  // 3. Shifts
  static async getShifts() {
    return prisma.shift.findMany({
      orderBy: { date: "asc" },
    });
  }

  // 4. Patients Records
  static async getPatients(search?: string) {
    const whereClause: any = {};
    if (search) {
      whereClause.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    return prisma.patient.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
    });
  }

  static async getPatientById(id: number) {
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new AppError(404, "NOT_FOUND", "Patient record not found");
    }

    return patient;
  }
}
