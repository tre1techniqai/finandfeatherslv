
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeStaffReturnPath } from "@/lib/auth/safe-staff-return-path";

export type ReservationStaffRole = "manager";

export async function requireReservationStaff(returnPath?: string) {
  const safeReturnPath = safeStaffReturnPath(returnPath);

  const loginUrl =
    `/staff/login?next=${encodeURIComponent(safeReturnPath)}`;

  const supabase = await createSupabaseServerClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect(loginUrl);
  }

  const { data: staffRole, error: roleError } = await supabase
    .from("staff_roles")
    .select("user_id, role, is_active")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (
    roleError ||
    !staffRole ||
    !staffRole.is_active ||
    staffRole.role !== "manager"
  ) {
    redirect("/staff/login?error=unauthorized");
  }

  return {
    supabase,
    userId,
    role: staffRole.role as ReservationStaffRole,
  };
}
