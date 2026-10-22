"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StaffLoginState = {
  error?: string;
};

const LOGIN_ERROR =
  "Unable to sign in or verify reservation staff access. Check your credentials or contact your administrator.";

function safeStaffRedirect(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") {
    return "/staff/reservations";
  }

  if (value === "/staff/reservations") {
    return value;
  }

  const match = /^\/staff\/reservations\/([0-9a-f-]{36})$/i.exec(value);

  if (
    match &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      match[1],
    )
  ) {
    return value;
  }

  return "/staff/reservations";
}

export async function signInReservationStaff(
  _previousState: StaffLoginState,
  formData: FormData,
): Promise<StaffLoginState> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const nextPath = safeStaffRedirect(formData.get("next"));

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