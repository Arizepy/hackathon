import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/contexts/RoleContext";

export type StaffMemberRole = "admin" | "staff" | "public";

// Helper to get auth headers with automatic silent login
async function getAuthHeaders(role: StaffMemberRole): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (role === "public") {
    return headers;
  }

  const tokenKey = `healthaccess_token_${role}`;
  let token = localStorage.getItem(tokenKey);

  if (!token) {
    try {
      const email = role === "admin" ? "supervisor@healthlinkgh.demo" : "nurse@healthlinkgh.demo";
      const password = "password123";
      
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        token = data.token;
        if (token) {
          localStorage.setItem(tokenKey, token);
        }
      }
    } catch (err) {
      console.error("Auto login failed:", err);
    }
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

// 1. Medicines Inventory
export function getListMedicinesQueryKey() {
  return ["medicines"];
}

export function useListMedicines(options?: { search?: string }) {
  const { role } = useRole();
  return useQuery({
    queryKey: [...getListMedicinesQueryKey(), options?.search, role],
    queryFn: async () => {
      const headers = await getAuthHeaders(role);
      const url = options?.search
        ? `/api/stations/my/items?search=${encodeURIComponent(options.search)}`
        : "/api/stations/my/items";
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to fetch medicines");
      return res.json();
    },
  });
}

export function useAdjustMedicineStock() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: { delta: number } }) => {
      const headers = await getAuthHeaders(role);
      const res = await fetch(`/api/stations/my/items/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to adjust stock");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListMedicinesQueryKey() });
      queryClient.invalidateQueries({ queryKey: ["inventorySummary"] });
      queryClient.invalidateQueries({ queryKey: ["stockDuration"] });
    },
  });
}

// 2. Inventory Summary
export function useGetInventorySummary() {
  const { role } = useRole();
  return useQuery({
    queryKey: ["inventorySummary", role],
    queryFn: async () => {
      const headers = await getAuthHeaders(role);
      const res = await fetch("/api/stations/my/summary", { headers });
      if (!res.ok) throw new Error("Failed to fetch inventory summary");
      return res.json();
    },
  });
}

export function useGetTopMedicines(options?: { period?: string }) {
  const { role } = useRole();
  return useQuery({
    queryKey: ["topMedicines", options?.period, role],
    queryFn: async () => {
      const headers = await getAuthHeaders(role);
      const period = options?.period || "weekly";
      const res = await fetch(`/api/stations/my/top-medicines?period=${period}`, { headers });
      if (!res.ok) throw new Error("Failed to fetch top medicines");
      return res.json();
    },
  });
}

// 3. Stock Duration Runway Estimator
export function useGetStockDuration() {
  const { role } = useRole();
  return useQuery({
    queryKey: ["stockDuration", role],
    queryFn: async () => {
      const headers = await getAuthHeaders(role);
      const res = await fetch("/api/stations/my/stock-duration", { headers });
      if (!res.ok) throw new Error("Failed to fetch stock duration");
      return res.json();
    },
  });
}

// 4. Facility Hours
export function useListFacilities() {
  const { role } = useRole();
  return useQuery({
    queryKey: ["facilities", role],
    queryFn: async () => {
      const headers = await getAuthHeaders(role);
      const res = await fetch("/api/facilities", { headers });
      if (!res.ok) throw new Error("Failed to fetch facilities");
      return res.json();
    },
  });
}

// 5. Stations Locator & Basic Care Guide
export function useListStations() {
  const { role } = useRole();
  return useQuery({
    queryKey: ["stations", role],
    queryFn: async () => {
      const headers = await getAuthHeaders(role);
      const res = await fetch("/api/stations", { headers });
      if (!res.ok) throw new Error("Failed to fetch stations");
      return res.json();
    },
  });
}

// 6. First Aid Training for Staff
export function getListTrainingAssignmentsQueryKey() {
  return ["trainingAssignments"];
}

export function useListTrainingModules() {
  const { role } = useRole();
  return useQuery({
    queryKey: ["trainingModules", role],
    queryFn: async () => {
      const headers = await getAuthHeaders(role);
      const res = await fetch("/api/training/modules", { headers });
      if (!res.ok) throw new Error("Failed to fetch training modules");
      return res.json();
    },
  });
}

export function useListTrainingAssignments() {
  const { role } = useRole();
  return useQuery({
    queryKey: getListTrainingAssignmentsQueryKey(),
    queryFn: async () => {
      const headers = await getAuthHeaders(role);
      const res = await fetch("/api/training/assignments", { headers });
      if (!res.ok) throw new Error("Failed to fetch training assignments");
      return res.json();
    },
  });
}

export function useCompleteTrainingAssignment() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string | number }) => {
      const headers = await getAuthHeaders(role);
      const res = await fetch(`/api/training/assignments/${id}/complete`, {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error("Failed to complete training assignment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListTrainingAssignmentsQueryKey() });
    },
  });
}

// 7. Shifts & Staff Management
export function useListShifts() {
  const { role } = useRole();
  return useQuery({
    queryKey: ["shifts", role],
    queryFn: async () => {
      const headers = await getAuthHeaders(role);
      const res = await fetch("/api/shifts", { headers });
      if (!res.ok) throw new Error("Failed to fetch shifts");
      return res.json();
    },
  });
}

// 8. Patients Records
export function useListPatients(options?: { search?: string }) {
  const { role } = useRole();
  return useQuery({
    queryKey: ["patients", options?.search, role],
    queryFn: async () => {
      const headers = await getAuthHeaders(role);
      const url = options?.search
        ? `/api/patients?search=${encodeURIComponent(options.search)}`
        : "/api/patients";
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to fetch patients");
      return res.json();
    },
  });
}

export function useGetPatient(id: number | string, options?: any) {
  const { role } = useRole();
  return useQuery({
    queryKey: ["getPatient", id, role],
    queryFn: async () => {
      if (!id) return null;
      const headers = await getAuthHeaders(role);
      const res = await fetch(`/api/patients/${id}`, { headers });
      if (!res.ok) throw new Error("Failed to fetch patient details");
      return res.json();
    },
    enabled: !!id && (options?.query?.enabled !== false),
  });
}
