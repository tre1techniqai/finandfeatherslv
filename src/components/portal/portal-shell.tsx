
import type { ReactNode } from "react";

import PortalHeader, {
  type PortalSection,
} from "@/components/portal/portal-header";

import type { ReservationStaffRole } from "@/lib/auth/require-reservation-staff";

import PortalFooter from "@/components/portal/portal-footer";

type PortalShellProps = {
  section: PortalSection;
  title?: string;
  staffRole?: ReservationStaffRole | null;
  userEmail?: string | null;
  children: ReactNode;
};

export default function PortalShell({
  section,
  title,
  staffRole = null,
  userEmail = null,
  children,
}: PortalShellProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-black text-white">
      <PortalHeader
        section={section}
        title={title}
        staffRole={staffRole}
        userEmail={userEmail}
      />

      <div className="flex w-full flex-1 flex-col">
        {children}
      </div>

      <PortalFooter />
    </div>
  );
}