
"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOutPortal(
  formData: FormData,
) {
  const destination =
    formData.get("destination") === "staff"
      ? "/staff/login"
      : "/admin/login";

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("Unable to sign out. Please try again.");
  }

  redirect(destination);
}
