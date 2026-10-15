
"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

const LOGIN_ERROR =
  "Unable to sign in or verify manager access. Check your credentials or contact your administrator.";

export async function signInManager(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

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
    .select("user_id, role, is_active")
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (
    roleError ||
    !staffRole ||
    staffRole.role !== "manager" ||
    !staffRole.is_active
  ) {
    await supabase.auth.signOut();
    return { error: LOGIN_ERROR };
  }

  redirect("/admin/menu");
}
