import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Stock adjust schemas
export const adjustStockSchema = z.object({
  delta: z.number({ required_error: "Delta is required" }),
});

// Restock request schemas (no body needed, builds automatically)

// Order submission schemas
export const createOrderLineSchema = z.object({
  catalogItemId: z.string().uuid("Catalog item ID must be a valid UUID"),
  qtyRequested: z.number().int().positive("Requested quantity must be a positive integer"),
});

export const createOrderSchema = z.object({
  lines: z.array(createOrderLineSchema).min(1, "Order must contain at least one item line"),
});

// Order approval schemas
export const approveOrderLineSchema = z.object({
  lineId: z.string().uuid("Line ID must be a valid UUID"),
  qtyApproved: z.number().int().nonnegative("Approved quantity must be zero or positive"),
});

export const approveOrderSchema = z.object({
  lines: z.array(approveOrderLineSchema).min(1, "Approval must contain at least one line"),
});

// Order rejection schemas
export const rejectOrderSchema = z.object({
  reason: z.string().min(5, "Rejection reason must be at least 5 characters long"),
});
