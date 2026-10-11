
"use client";

import { useState, type FormEvent } from "react";

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

export default function LoyaltyProgram() {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      mobileNumber: String(formData.get("mobileNumber") ?? ""),
      marketingConsent: formData.get("marketingConsent") === "on",
      company: String(formData.get("company") ?? ""),
    };

    try {
      const response = await fetch("/api/loyalty-signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Signup failed. Please try again.",
        );
      }

      form.reset();
      setStatus("success");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
      setStatus("error");
    }
  }

  const inputClassName =
    "mt-2 w-full rounded-lg border border-white/25 bg-black/70 px-4 py-3 text-base text-white placeholder:text-white/45 focus:border-[#ea1b24] focus:outline-none focus:ring-2 focus:ring-[#ea1b24]/40";

  return (
    <section
      id="loyalty-program"
      className="mt-8 border-t border-white/15 bg-transparent px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mx-auto max-w-[1500px]">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-bold tracking-[0.2em] text-yellow-400">
              FIN &amp; FEATHERS
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Join Our Loyalty Program
            </h2>

            <p className="mt-3 text-lg text-white/80">
              Get exclusive offers and rewards!
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-white/15 bg-black/65 p-5 shadow-xl sm:p-8"
          >
            {/* Honeypot field for basic bot filtering. */}
            <div
              aria-hidden="true"
              className="absolute -left-[9999px] h-px w-px overflow-hidden"
            >
              <label htmlFor="loyalty-company">
                Leave this field empty
              </label>
              <input
                id="loyalty-company"
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div>
              <label
                htmlFor="loyalty-full-name"
                className="block text-sm font-semibold text-white"
              >
                Full Name <span className="text-[#ea1b24]">*</span>
              </label>
              <input
                id="loyalty-full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                maxLength={120}
                required
                placeholder="Enter your full name"
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="loyalty-email"
                className="block text-sm font-semibold text-white"
              >
                Email Address <span className="text-[#ea1b24]">*</span>
              </label>
              <input
                id="loyalty-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                placeholder="you@example.com"
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="loyalty-mobile"
                className="block text-sm font-semibold text-white"
              >
                Mobile Number{" "}
                <span className="font-normal text-white/60">
                  (optional)
                </span>
              </label>
              <input
                id="loyalty-mobile"
                name="mobileNumber"
                type="tel"
                autoComplete="tel"
                maxLength={30}
                placeholder="Enter your mobile number"
                className={inputClassName}
              />
            </div>

            <div className="rounded-lg border border-white/15 bg-white/[0.04] p-4">
              <div className="flex items-start gap-3">
                <input
                  id="loyalty-marketing-consent"
                  name="marketingConsent"
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-[#ea1b24] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                />

                <label
                  htmlFor="loyalty-marketing-consent"
                  className="text-sm leading-6 text-white/80"
                >
                  By checking this box, I agree to receive recurring
                  automated marketing SMS text messages and/or emails
                  from Fin &amp; Feathers at the number provided. Consent
                  is not a condition of purchase. Msg &amp; data rates may
                  apply. View our{" "}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-white underline underline-offset-4 hover:text-[#ea1b24]"
                  >
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a
                    href="/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-white underline underline-offset-4 hover:text-[#ea1b24]"
                  >
                    Terms &amp; Conditions
                  </a>
                  .
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="flex min-h-[54px] w-full items-center justify-center rounded-xl border border-white/20 bg-[#ea1b24] px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#c9161e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "submitting" ? "Joining..." : "Join Now"}
            </button>

            <div aria-live="polite" aria-atomic="true">
              {status === "success" && (
                <p className="rounded-lg border border-green-500/40 bg-green-950/40 p-3 text-sm text-green-200">
                  Thanks for joining! Your signup has been received.
                </p>
              )}

              {status === "error" && (
                <p className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">
                  {errorMessage}
                </p>
              )}
            </div>

            <p className="text-center text-xs leading-5 text-white/50">
              Marketing consent is optional. If you do not check the box,
              your information will be recorded without marketing consent.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
