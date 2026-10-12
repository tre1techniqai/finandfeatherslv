
import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Fin & Feathers Las Vegas",
  description:
    "Mobile messaging and SMS privacy policy for Fin & Feathers Las Vegas.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:px-8 sm:py-16">

        <div className="mb-8 border-b border-white/20 pb-6">
          <p className="text-xs font-bold tracking-[0.2em] text-red-300">
            FIN &amp; FEATHERS · LAS VEGAS
          </p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold sm:text-4xl">
              Privacy Policy
            </h1>

            <a
              href="/"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border border-white/30 bg-black/40 px-4 py-2 text-sm font-medium text-white transition hover:border-[#ea1b24] hover:bg-[#ea1b24] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea1b24] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>

              Back to Home
            </a>
          </div>

          <p className="mt-3 text-sm text-white/65">
            Mobile messaging and SMS privacy
          </p>
        </div>

        <article className="space-y-8 text-base leading-7 text-white/85">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Mobile Messaging &amp; SMS Privacy Policy
            </h2>
            <p>
              Fin &amp; Feathers (&quot;we,&quot; &quot;us,&quot; or
              {" "}&quot;our&quot;) is committed to protecting your privacy.
              This section describes how we collect and handle information
              for our reservation-by-text and mobile messaging services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              1. Information We Collect
            </h2>
            <p>
              When you interact with our reservation system—either by
              submitting our online reservation form or by texting us
              directly at (702) 546-6394—we collect your mobile phone number,
              name, and any reservation details you provide (such as party
              size, date, time, seating preferences, and email address). We
              also collect your name, mobile phone number, and email address
              when you voluntarily sign up for our &quot;Join Our Loyalty
              Program&quot; form located on our homepage.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              2. How We Use Your Information
            </h2>
            <p>
              We use your mobile information exclusively to process,
              pre-qualify, coordinate, and confirm your restaurant reservation
              requests, as well as to collect mandatory large-party deposit
              information. We do not use your reservation phone number for
              unsolicited promotional text marketing campaigns. For members
              of our Loyalty Program, we use your information to send
              exclusive rewards, birthday offers, special event invitations,
              and promotional updates. You will only receive promotional
              marketing messages if you explicitly opt-in via our homepage
              loyalty form.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              3. Protection of SMS Opt-In Data (Carrier Compliance)
            </h2>
            <p>
              We deeply value your privacy. Your mobile information, SMS
              opt-in data, and consent details—for both reservations and our
              Loyalty Program—will strictly NOT be shared, sold, rented, or
              leased to any third parties, affiliates, or data brokers for
              marketing or promotional purposes under any circumstances.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              4. Your Choices and Opt-Out
            </h2>
            <p>
              You can cancel the SMS service at any time. Just text
              {" "}&quot;STOP&quot; to (702) 546-6394. After you send the SMS
              message &quot;STOP&quot; to us, we will send you an SMS message
              to confirm that you have been unsubscribed. After this, you
              will no longer receive SMS messages from us unless you initiate
              a new reservation request. If you want to join again, just sign
              up as you did the first time or text us a new reservation
              request.
            </p>
          </section>
        </article>

        <div className="mt-12 border-t border-white/15 pt-6">
          <a
            href="/terms-of-service"
            className="font-semibold text-red-300 underline underline-offset-4 hover:text-white"
          >
            Read our Terms of Service
          </a>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
