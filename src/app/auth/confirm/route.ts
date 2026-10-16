import { createHmac, randomBytes } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const SITE_URL = "https://finandfeatherslv.live";
const RECOVERY_COOKIE_NAME = "ff_password_recovery";
const RECOVERY_TTL_SECONDS = 15 * 60;

function createRecoveryAuthorization(userId: string): string {
  const secret = process.env.PASSWORD_RECOVERY_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("PASSWORD_RECOVERY_SECRET is not configured securely.");
  }

  const expiresAt = Math.floor(Date.now() / 1000) + RECOVERY_TTL_SECONDS;
  const nonce = randomBytes(16).toString("hex");

  const payload = `${userId}.${expiresAt}.${nonce}`;

  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

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

  const response = NextResponse.redirect(
    new URL("/admin/reset-password", SITE_URL),
  );

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

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "recovery",
  });

  if (error || !data.user) {
    console.error(
      "Manager recovery verification failed:",
      error?.code ?? "missing-user",
    );

    response.headers.set("Location", invalidLinkUrl.toString());
    return response;
  }

  const authorization = createRecoveryAuthorization(data.user.id);

  response.cookies.set(RECOVERY_COOKIE_NAME, authorization, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin/reset-password",
    maxAge: RECOVERY_TTL_SECONDS,
  });

  return response;
}