import { create } from "zustand"
import { StaffMemberRole } from "@workspace/api-client-react"

interface RoleStore {
  role: StaffMemberRole
  setRole: (role: StaffMemberRole) => void
}

export const useRoleStore = create<RoleStore>((set: any) => ({
  role: "admin",
  setRole: (role: any) => set({ role }),
}))
