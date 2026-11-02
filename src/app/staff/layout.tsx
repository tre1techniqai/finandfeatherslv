
import {
  Suspense,
  type ReactNode,
} from "react";

import { connection } from "next/server";

import PortalRouteLayout from "@/components/portal/portal-route-layout";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  isReservationStaffRole,
  type ReservationStaffRole,
} from "@/lib/auth/require-reservation-staff";

async function AuthorizedStaffLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Resolve authentication and staff identity at request time.
  // Do not execute Supabase authentication during prerendering.
  await connection();

  let staffRole: ReservationStaffRole | null = null;
  let userEmail: string | null = null;

  const supabase = await createSupabaseServerClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (!claimsError && userId) {
    const {
      data: staffRecord,
      error: roleError,
    } = await supabase
      .from("staff_roles")
      .select("role, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (
      !roleError &&
      staffRecord?.is_active === true &&
      isReservationStaffRole(staffRecord.role)
    ) {
      staffRole = staffRecord.role;

      const emailClaim = claimsData?.claims?.email;

      if (
        typeof emailClaim === "string" &&
        emailClaim.trim()
      ) {
        userEmail = emailClaim.trim();
      }
    }
  }

  return (
    <PortalRouteLayout
      section="staff"
      staffRole={staffRole}
      userEmail={userEmail}
    >
      {children}
    </PortalRouteLayout>
  );
}

export default function StaffLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <PortalRouteLayout
          section="staff"
          staffRole={null}
          userEmail={null}
        >
          {children}
        </PortalRouteLayout>
      }
    >
      <AuthorizedStaffLayout>
        {children}
      </AuthorizedStaffLayout>
    </Suspense>
  );
}