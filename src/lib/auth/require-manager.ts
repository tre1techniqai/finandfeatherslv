
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireManager() {
  const supabase = await createSupabaseServerClient();

  // Verify the authenticated session.
  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/admin/login");
  }

  // Verify that this user has an active manager role.
  const { data: staffRole, error: roleError } = await supabase
    .from("staff_roles")
    .select("user_id, role, is_active")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (
    roleError ||
    !staffRole ||
    staffRole.role !== "manager" ||
    !staffRole.is_active
  ) {
    redirect("/admin/login?error=unauthorized");
  }

  return {
    supabase,
    userId,
  };
}
