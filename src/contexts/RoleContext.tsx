import React, { createContext, useContext, useState } from 'react';
import { StaffMemberRole } from "@workspace/api-client-react";

interface RoleContextType {
  role: StaffMemberRole;
  setRole: (role: StaffMemberRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<StaffMemberRole>("admin");
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) throw new Error("useRole must be used within RoleProvider");
  return context;
}
