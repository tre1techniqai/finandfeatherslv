
import type { ReactNode } from "react";
import PortalHeader, {
  type PortalSection,
} from "@/components/portal/portal-header";
import PortalFooter from "@/components/portal/portal-footer";

type PortalShellProps = {
  section: PortalSection;
  title?: string;
  children: ReactNode;
};

export default function PortalShell({
  section,
  title,
  children,
}: PortalShellProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-black text-white">
      <PortalHeader
        section={section}
        title={title}
      />

      <div className="flex w-full flex-1 flex-col">
        {children}
      </div>

      <PortalFooter />
    </div>
  );
}
