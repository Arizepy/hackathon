export type Role = "NURSE" | "DOCTOR" | "SUPERVISOR" | "PHARMACY";
export const Role = {
  NURSE: "NURSE" as const,
  DOCTOR: "DOCTOR" as const,
  SUPERVISOR: "SUPERVISOR" as const,
  PHARMACY: "PHARMACY" as const,
};

export type StationKind = "CLINIC" | "VOLUNTEER";
export const StationKind = {
  CLINIC: "CLINIC" as const,
  VOLUNTEER: "VOLUNTEER" as const,
};

export type OrderStatus = "SUBMITTED" | "APPROVED" | "REJECTED" | "DISPATCHED" | "DELIVERED";
export const OrderStatus = {
  SUBMITTED: "SUBMITTED" as const,
  APPROVED: "APPROVED" as const,
  REJECTED: "REJECTED" as const,
  DISPATCHED: "DISPATCHED" as const,
  DELIVERED: "DELIVERED" as const,
};
