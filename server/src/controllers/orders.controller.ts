import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/orderService";
import {
  createOrderSchema,
  approveOrderSchema,
  rejectOrderSchema,
} from "../validation/schemas";
import prisma from "../db/client";
import { OrderStatus } from "../types/enums";
import { AppError } from "../middleware/errorHandler";

export class OrdersController {
  // Helper to resolve "my" to actual station ID
  private static async resolveStationId(req: Request): Promise<string> {
    const { id } = req.params;
    if (id === "my") {
      const stationId = req.user?.stationId;
      if (!stationId) {
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

  // 1. GET /api/catalog
  static async getCatalog(req: Request, res: Response, next: NextFunction) {
    try {
      const catalog = await prisma.nationalCatalogItem.findMany({
        orderBy: { name: "asc" },
      });
      return res.status(200).json(catalog);
    } catch (err) {
      next(err);
    }
  }

  // 2. POST /api/stations/:id/orders
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const stationId = await OrdersController.resolveStationId(req);
      const validated = createOrderSchema.parse(req.body);
      const requestedById = req.user?.id || "";

      const order = await OrderService.createOrder(stationId, requestedById, validated.lines);
      return res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }

  // 3. GET /api/stations/:id/orders
  static async getStationOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const stationId = await OrdersController.resolveStationId(req);
      const orders = await OrderService.getStationOrders(stationId);
      return res.status(200).json(orders);
    } catch (err) {
      next(err);
    }
  }

  // 4. GET /api/stations/:id/orders/suggested
  static async getSuggestedOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const stationId = await OrdersController.resolveStationId(req);
      const suggested = await OrderService.getSuggestedOrder(stationId);
      return res.status(200).json(suggested);
    } catch (err) {
      next(err);
    }
  }

  // 5. GET /api/orders (Pharmacy only queue)
  static async getOrdersQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as OrderStatus | undefined;
      const queue = await OrderService.getOrdersQueue(status);
      return res.status(200).json(queue);
    } catch (err) {
      next(err);
    }
  }

  // 6. POST /api/orders/:id/approve (Pharmacy only)
  static async approveOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = approveOrderSchema.parse(req.body);
      
      const approved = await OrderService.approveOrder(id, validated.lines);
      return res.status(200).json(approved);
    } catch (err) {
      next(err);
    }
  }

  // 7. POST /api/orders/:id/reject (Pharmacy only)
  static async rejectOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = rejectOrderSchema.parse(req.body);

      const rejected = await OrderService.rejectOrder(id, validated.reason);
      return res.status(200).json(rejected);
    } catch (err) {
      next(err);
    }
  }

  // 8. POST /api/orders/:id/dispatch (Pharmacy only)
  static async dispatchOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const dispatched = await OrderService.dispatchOrder(id);
      return res.status(200).json(dispatched);
    } catch (err) {
      next(err);
    }
  }

  // 9. POST /api/orders/:id/deliver (Station staff/supervisor only)
  static async deliverOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stationId = req.user?.stationId;

      if (!stationId) {
        throw new AppError(400, "BAD_REQUEST", "User does not have an assigned station to deliver to");
      }

      const delivered = await OrderService.deliverOrder(id, stationId);
      return res.status(200).json(delivered);
    } catch (err) {
      next(err);
    }
  }
}
