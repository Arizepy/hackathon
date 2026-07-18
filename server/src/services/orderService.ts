import { OrderStatusEvent } from "@prisma/client";
import { OrderStatus } from "../types/enums";
import prisma from "../db/client";
import { AppError } from "../middleware/errorHandler";

export class OrderService {
  // 1. Submit Gov Order
  static async createOrder(
    stationId: string,
    requestedById: string,
    lines: { catalogItemId: string; qtyRequested: number }[]
  ) {
    if (!lines || lines.length === 0) {
      throw new AppError(400, "BAD_REQUEST", "Order must contain at least one item line");
    }

    return prisma.$transaction(async (tx) => {
      const order = await tx.govOrder.create({
        data: {
          stationId,
          requestedById,
          status: OrderStatus.SUBMITTED,
        },
      });

      const orderLines = lines.map((line) => ({
        govOrderId: order.id,
        catalogItemId: line.catalogItemId,
        qtyRequested: line.qtyRequested,
      }));

      await tx.govOrderLine.createMany({
        data: orderLines,
      });

      await tx.orderStatusEvent.create({
        data: {
          govOrderId: order.id,
          status: OrderStatus.SUBMITTED,
          note: "Order submitted to national pharmacy",
        },
      });

      return tx.govOrder.findUnique({
        where: { id: order.id },
        include: {
          lines: {
            include: { catalogItem: true },
          },
          history: true,
        },
      });
    });
  }

  // 2. Station's order history, newest first
  static async getStationOrders(stationId: string) {
    return prisma.govOrder.findMany({
      where: { stationId },
      include: {
        lines: {
          include: { catalogItem: true },
        },
        history: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // 3. Suggested Order for Station
  static async getSuggestedOrder(stationId: string) {
    const stationItems = await prisma.item.findMany({
      where: { stationId },
    });

    const catalogItems = await prisma.nationalCatalogItem.findMany();

    const suggestions = [];

    for (const item of stationItems) {
      // Find matching catalog item by name
      const catalogMatch = catalogItems.find(
        (c) => c.name.toLowerCase() === item.name.toLowerCase()
      );

      if (catalogMatch && item.qty <= item.threshold) {
        const qtyRequested = Math.max(item.threshold * 2 - item.qty, item.threshold);
        suggestions.push({
          catalogItemId: catalogMatch.id,
          name: catalogMatch.name,
          unit: catalogMatch.unit,
          qtyRequested,
        });
      }
    }

    return suggestions;
  }

  // 4. Pharmacy full queue (filterable by status, oldest first)
  static async getOrdersQueue(status?: OrderStatus) {
    const whereClause = status ? { status } : {};
    return prisma.govOrder.findMany({
      where: whereClause,
      include: {
        station: true,
        lines: {
          include: { catalogItem: true },
        },
        history: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  // 5. Approve Order (Pharmacy only, in transaction, validates national stock)
  static async approveOrder(orderId: string, linesApproval: { lineId: string; qtyApproved: number }[]) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.govOrder.findUnique({
        where: { id: orderId },
        include: {
          lines: {
            include: { catalogItem: true },
          },
        },
      });

      if (!order) {
        throw new AppError(404, "NOT_FOUND", "Order not found");
      }

      if (order.status !== OrderStatus.SUBMITTED) {
        throw new AppError(
          409,
          "INVALID_TRANSITION",
          `Cannot approve order in current state: ${order.status}`
        );
      }

      // Validate national stock levels for all approved lines first
      for (const approval of linesApproval) {
        const line = order.lines.find((l) => l.id === approval.lineId);
        if (!line) {
          throw new AppError(
            400,
            "BAD_REQUEST",
            `Line item ${approval.lineId} does not belong to this order`
          );
        }

        const catalogItem = await tx.nationalCatalogItem.findUnique({
          where: { id: line.catalogItemId },
        });

        if (!catalogItem) {
          throw new AppError(404, "NOT_FOUND", "Catalog item not found");
        }

        if (approval.qtyApproved > catalogItem.nationalStock) {
          throw new AppError(
            409,
            "INSUFFICIENT_STOCK",
            `Insufficient national stock for line ${line.id} (${catalogItem.name}). Requested approved: ${approval.qtyApproved}, Available: ${catalogItem.nationalStock}`
          );
        }
      }

      // All checks passed! Commit reductions and update status
      for (const approval of linesApproval) {
        const line = order.lines.find((l) => l.id === approval.lineId)!;

        // Decrement national stock
        await tx.nationalCatalogItem.update({
          where: { id: line.catalogItemId },
          data: {
            nationalStock: {
              decrement: approval.qtyApproved,
            },
          },
        });

        // Set approved quantity
        await tx.govOrderLine.update({
          where: { id: approval.lineId },
          data: { qtyApproved: approval.qtyApproved },
        });
      }

      // Update order status
      const updatedOrder = await tx.govOrder.update({
        where: { id: orderId },
        data: { status: OrderStatus.APPROVED },
      });

      await tx.orderStatusEvent.create({
        data: {
          govOrderId: orderId,
          status: OrderStatus.APPROVED,
          note: "Order approved by national pharmacy",
        },
      });

      return updatedOrder;
    });
  }

  // 6. Reject Order (Pharmacy only, reason required)
  static async rejectOrder(orderId: string, reason: string) {
    if (!reason || reason.trim().length < 5) {
      throw new AppError(400, "BAD_REQUEST", "Reason must be at least 5 characters long");
    }

    return prisma.$transaction(async (tx) => {
      const order = await tx.govOrder.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new AppError(404, "NOT_FOUND", "Order not found");
      }

      if (order.status !== OrderStatus.SUBMITTED) {
        throw new AppError(
          409,
          "INVALID_TRANSITION",
          `Cannot reject order in current state: ${order.status}`
        );
      }

      const updated = await tx.govOrder.update({
        where: { id: orderId },
        data: { status: OrderStatus.REJECTED },
      });

      await tx.orderStatusEvent.create({
        data: {
          govOrderId: orderId,
          status: OrderStatus.REJECTED,
          note: `Rejected: ${reason}`,
        },
      });

      return updated;
    });
  }

  // 7. Dispatch Order (Pharmacy only)
  static async dispatchOrder(orderId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.govOrder.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new AppError(404, "NOT_FOUND", "Order not found");
      }

      if (order.status !== OrderStatus.APPROVED) {
        throw new AppError(
          409,
          "INVALID_TRANSITION",
          `Cannot dispatch order in current state: ${order.status}`
        );
      }

      const updated = await tx.govOrder.update({
        where: { id: orderId },
        data: { status: OrderStatus.DISPATCHED },
      });

      await tx.orderStatusEvent.create({
        data: {
          govOrderId: orderId,
          status: OrderStatus.DISPATCHED,
          note: "Order dispatched and shipped",
        },
      });

      return updated;
    });
  }

  // 8. Deliver Order (Station staff/supervisor only, increments station stock)
  static async deliverOrder(orderId: string, stationId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.govOrder.findUnique({
        where: { id: orderId },
        include: {
          lines: {
            include: { catalogItem: true },
          },
        },
      });

      if (!order) {
        throw new AppError(404, "NOT_FOUND", "Order not found");
      }

      // Enforce station scope
      if (order.stationId !== stationId) {
        throw new AppError(
          403,
          "FORBIDDEN",
          "You cannot mark an order delivered for a different station"
        );
      }

      if (order.status !== OrderStatus.DISPATCHED) {
        throw new AppError(
          409,
          "INVALID_TRANSITION",
          `Cannot deliver order in current state: ${order.status}`
        );
      }

      // Increment local station stocks for all approved line quantities
      for (const line of order.lines) {
        const approvedQty = line.qtyApproved || 0;
        if (approvedQty <= 0) continue;

        // Try to find local item by name match
        const localItem = await tx.item.findFirst({
          where: {
            stationId: order.stationId,
            name: line.catalogItem.name,
          },
        });

        if (localItem) {
          // Increment stock
          await tx.item.update({
            where: { id: localItem.id },
            data: {
              qty: {
                increment: approvedQty,
              },
            },
          });
        } else {
          // If the station doesn't track this catalog item, create it
          await tx.item.create({
            data: {
              stationId: order.stationId,
              name: line.catalogItem.name,
              unit: line.catalogItem.unit,
              qty: approvedQty,
              threshold: 50, // default threshold
              batchNumber: "DELIVERED-BATCH",
            },
          });
        }
      }

      const updated = await tx.govOrder.update({
        where: { id: orderId },
        data: { status: OrderStatus.DELIVERED },
      });

      await tx.orderStatusEvent.create({
        data: {
          govOrderId: orderId,
          status: OrderStatus.DELIVERED,
          note: "Order delivered and inventory stock adjusted",
        },
      });

      return updated;
    });
  }
}
