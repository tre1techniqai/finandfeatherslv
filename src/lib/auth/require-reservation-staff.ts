import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ReservationStaffRole = "manager";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getSafeReturnPath(value?: string): string {
  if (!value || value === "/staff/reservations") {
    return "/staff/reservations";
  }

  const match = /^\/staff\/reservations\/([^/]+)$/.exec(value);

  if (match && UUID_PATTERN.test(match[1])) {
    return value;
  }

  return "/staff/reservations";
}

export async function requireReservationStaff(returnPath?: string) {
  const safeReturnPath = getSafeReturnPath(returnPath);

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