import { Request, Response, NextFunction } from "express";
import { StockService } from "../services/stockService";
import { adjustStockSchema } from "../validation/schemas";
import { AppError } from "../middleware/errorHandler";
import prisma from "../db/client";

export class StationsController {
  // Helper to resolve "my" to the actual station ID
  private static async resolveStationId(req: Request): Promise<string> {
    const { id } = req.params;
    if (id === "my") {
      const stationId = req.user?.stationId;
      if (!stationId) {
        // Fallback for Supervisors / Pharmacy who don't have a primary station
        const defaultStation = await prisma.station.findFirst();
        if (!defaultStation) {
          throw new AppError(404, "NOT_FOUND", "No stations found in system");
        }
        return defaultStation.id;
      }
      return stationId;
    }
    return id;
  }

  // 1. GET /api/stations
  static async listStations(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
      }

      // Supervisor/Pharmacy: all stations. Nurse/Doctor: only their own station (returned as list of one)
      if (req.user.role === "SUPERVISOR" || req.user.role === "PHARMACY") {
        const stations = await prisma.station.findMany();
        return res.status(200).json(stations);
      } else {
        const stationId = req.user.stationId;
        if (!stationId) {
          return res.status(200).json([]);
        }
        const station = await prisma.station.findUnique({
          where: { id: stationId },
        });
        return res.status(200).json(station ? [station] : []);
      }
    } catch (err) {
      next(err);
    }
  }

  // 2. GET /api/stations/:id
  static async getStationDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const stationId = await StationsController.resolveStationId(req);
      const station = await prisma.station.findUnique({
        where: { id: stationId },
        include: { items: true },
      });

      if (!station) {
        throw new AppError(404, "NOT_FOUND", "Station not found");
      }

      return res.status(200).json(station);
    } catch (err) {
      next(err);
    }
  }

  // 3. GET /api/stations/:id/items
  static async getStationItems(req: Request, res: Response, next: NextFunction) {
    try {
      const stationId = await StationsController.resolveStationId(req);
      const search = req.query.search as string;
      const items = await StockService.getStationItems(stationId, search);
      return res.status(200).json(items);
    } catch (err) {
      next(err);
    }
  }

  // 4. PATCH /api/stations/:id/items/:itemId
  static async adjustStock(req: Request, res: Response, next: NextFunction) {
    try {
      const stationId = await StationsController.resolveStationId(req);
      const { itemId } = req.params;
      const validated = adjustStockSchema.parse(req.body);

      const updated = await StockService.adjustQty(stationId, itemId, validated.delta);
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  // 5. GET /api/stations/:id/summary
  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const stationId = await StationsController.resolveStationId(req);
      const summary = await StockService.getInventorySummary(stationId);
      return res.status(200).json(summary);
    } catch (err) {
      next(err);
    }
  }

  // 6. GET /api/stations/:id/top-medicines
  static async getTopMedicines(req: Request, res: Response, next: NextFunction) {
    try {
      const stationId = await StationsController.resolveStationId(req);
      const period = req.query.period as string;
      const top = await StockService.getTopMedicines(stationId, period);
      return res.status(200).json(top);
    } catch (err) {
      next(err);
    }
  }

  // 7. GET /api/stations/:id/stock-duration
  static async getStockDuration(req: Request, res: Response, next: NextFunction) {
    try {
      const stationId = await StationsController.resolveStationId(req);
      const estimates = await StockService.getStockDuration(stationId);
      return res.status(200).json(estimates);
    } catch (err) {
      next(err);
    }
  }

  // 8. POST /api/stations/:id/restock-requests
  static async createRestockRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const stationId = await StationsController.resolveStationId(req);
      const request = await StockService.createRestockRequest(stationId);
      return res.status(201).json(request);
    } catch (err) {
      next(err);
    }
  }

  // 9. GET /api/stations/:id/restock-requests
  static async getRestockHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const stationId = await StationsController.resolveStationId(req);
      const history = await StockService.getStationRestockRequests(stationId);
      return res.status(200).json(history);
    } catch (err) {
      next(err);
    }
  }

  // 10. GET /api/restock-requests (Supervisor only queue)
  static async getAllRestockRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const requests = await StockService.getAllRestockRequests();
      return res.status(200).json(requests);
    } catch (err) {
      next(err);
    }
  }
}
