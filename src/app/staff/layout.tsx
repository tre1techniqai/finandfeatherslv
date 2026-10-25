
import type { ReactNode } from "react";
import PortalRouteLayout from "@/components/portal/portal-route-layout";

export default function StaffLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <PortalRouteLayout section="staff">
      {children}
    </PortalRouteLayout>
  );
}
