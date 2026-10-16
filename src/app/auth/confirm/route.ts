import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const SITE_URL = "https://finandfeatherslv.live";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  const invalidLinkUrl = new URL(
    "/admin/reset-password?error=invalid-link",
    SITE_URL,
  );

  if (!tokenHash || type !== "recovery") {
    return NextResponse.redirect(invalidLinkUrl);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase authentication configuration.");

    return NextResponse.redirect(invalidLinkUrl);
  }

  const successUrl = new URL("/admin/reset-password", SITE_URL);

  const response = NextResponse.redirect(successUrl);

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },

      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);

          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "recovery",
  });

  if (error) {
    console.error(
      "Manager recovery verification failed:",
      error.code,
    );

    response.headers.set("Location", invalidLinkUrl.toString());
  }

  return response;
}