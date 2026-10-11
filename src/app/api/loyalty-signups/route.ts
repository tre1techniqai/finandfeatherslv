
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const CONSENT_TEXT =
  "By checking this box, I agree to receive recurring automated marketing SMS text messages and/or emails from Fin & Feathers at the number provided. Consent is not a condition of purchase. Msg & data rates may apply. View our Privacy Policy and Terms & Conditions.";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Please check your information and try again." },
        { status: 400 },
      );
    }

    const data = body as Record<string, unknown>;

    // Quietly ignore likely bot submissions from the hidden honeypot.
    if (typeof data.company === "string" && data.company.trim()) {
      return NextResponse.json({ success: true });
    }

    const fullName =
      typeof data.fullName === "string" ? data.fullName.trim() : "";
    const email =
      typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
    const mobileNumber =
      typeof data.mobileNumber === "string"
        ? data.mobileNumber.trim()
        : "";
    const marketingConsent = data.marketingConsent === true;

    if (!fullName || fullName.length > 120) {
      return NextResponse.json(
        { error: "Please enter your full name (up to 120 characters)." },
        { status: 400 },
      );
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (mobileNumber.length > 30) {
      return NextResponse.json(
        { error: "Please check your mobile number." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase.from("loyalty_signups").insert({
      full_name: fullName,
      email,
      mobile_number: mobileNumber || null,
      marketing_consent: marketingConsent,
      marketing_consent_at: marketingConsent
        ? new Date().toISOString()
        : null,
      marketing_consent_text: marketingConsent ? CONSENT_TEXT : null,
    });

    if (error) {
      console.error("Loyalty signup insert failed:", error.code);

      return NextResponse.json(
        {
          error:
            "We couldn't complete your signup right now. Please try again shortly.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Loyalty signup request failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      {
        error:
          "We couldn't complete your signup right now. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
