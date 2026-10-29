
"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeStaffReturnPath } from "@/lib/auth/safe-staff-return-path";

export type StaffLoginState = {
  error?: string;
};

const LOGIN_ERROR =
  "Unable to sign in or verify reservation staff access. Check your credentials or contact your administrator.";

export async function signInReservationStaff(
  _previousState: StaffLoginState,
  formData: FormData,
): Promise<StaffLoginState> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const nextPath = safeStaffReturnPath(formData.get("next"));

  if (
    typeof emailValue !== "string" ||
    typeof passwordValue !== "string" ||
    !emailValue.trim() ||
    !passwordValue
  ) {
    return { error: "Enter your email address and password." };
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailValue.trim(),
    password: passwordValue,
  });

  if (error || !data.user) {
    return { error: LOGIN_ERROR };
  }

  const { data: staffRole, error: roleError } = await supabase
    .from("staff_roles")
    .select("role, is_active")
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (
    roleError ||
    !staffRole ||
    !staffRole.is_active ||
    (staffRole.role !== "manager" &&
      staffRole.role !== "reservation_agent")
  ) {
    await supabase.auth.signOut();
    return { error: LOGIN_ERROR };
  }

  redirect(nextPath);
}
