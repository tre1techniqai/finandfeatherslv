import { createHmac, randomBytes } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const SITE_URL = "https://finandfeatherslv.live";
const RECOVERY_COOKIE_NAME = "ff_password_recovery";
const RECOVERY_TTL_SECONDS = 15 * 60;
const INVITE_COOKIE_NAME = "ff_staff_invite_setup";
const INVITE_TTL_SECONDS = 30 * 60;
const INVITE_PURPOSE = "staff-invite-setup";

// Preserve the existing manager recovery token format so that
// /admin/reset-password continues to validate previously issued links.
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

// Domain-separate the staff invitation authorization from recovery tokens.
// The staff setup page verifies the purpose as well as the user and expiry.
function createStaffInviteAuthorization(userId: string): string {
  const secret = process.env.PASSWORD_RECOVERY_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("PASSWORD_RECOVERY_SECRET is not configured securely.");
  }

  const expiresAt = Math.floor(Date.now() / 1000) + INVITE_TTL_SECONDS;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${INVITE_PURPOSE}.${userId}.${expiresAt}.${nonce}`;
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const isRecovery = type === "recovery";
  const isInvite = type === "invite";

  const invalidLinkUrl = new URL(
    isInvite
      ? "/staff/login?error=invalid-invite"
      : "/admin/reset-password?error=invalid-link",
    SITE_URL,
  );

  if (!tokenHash || (!isRecovery && !isInvite)) {
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

  // Maintain one response object so that SSR auth cookies set during
  // verifyOtp are retained even when the redirect destination changes.
  const response = NextResponse.redirect(
    new URL(
      isRecovery ? "/admin/reset-password" : "/staff/accept-invite",
      SITE_URL,
    ),
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
    type: isInvite ? "invite" : "recovery",
  });

  if (error || !data.user) {
    console.error("Auth link verification failed:", error?.code ?? "missing-user");
    response.headers.set("Location", invalidLinkUrl.toString());
    return response;
  }

  if (isRecovery) {
    response.cookies.set(
      RECOVERY_COOKIE_NAME,
      createRecoveryAuthorization(data.user.id),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/admin/reset-password",
        maxAge: RECOVERY_TTL_SECONDS,
      },
    );
    return response;
  }

  // Verify the provisioned staff role before issuing setup authorization.
  const { data: staffRole, error: roleError } = await supabase
    .from("staff_roles")
    .select("role, is_active")
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (
    roleError ||
    !staffRole ||
    staffRole.is_active !== true ||
    (staffRole.role !== "manager" && staffRole.role !== "reservation_agent")
  ) {
    console.error("Invitation verified without active staff authorization.");
    await supabase.auth.signOut();
    response.headers.set(
      "Location",
      new URL("/staff/login?error=unauthorized", SITE_URL).toString(),
    );
    return response;
  }

  if (staffRole.role === "manager") {
    response.headers.set(
      "Location",
      new URL("/admin/accept-invite", SITE_URL).toString(),
    );
    return response;
  }

  response.cookies.set(
    INVITE_COOKIE_NAME,
    createStaffInviteAuthorization(data.user.id),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/staff/accept-invite",
      maxAge: INVITE_TTL_SECONDS,
    },
  );

  return response;
}