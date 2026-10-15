
"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOutManager(_formData: FormData) {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect("/admin/login");
}
