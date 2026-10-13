
import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Fin & Feathers Las Vegas",
  description:
  "Privacy policy for Fin & Feathers Las Vegas reservation messaging and the F&F FAM CLUB promotional program.",
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
              &quot;our&quot;) is committed to protecting your privacy.
              This policy explains how we collect, use, and protect
              information provided through our restaurant reservation
              services and the F&amp;F FAM CLUB promotional program,
              including communications by SMS text message and email.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              1. Information We Collect
            </h2>
            <p>
              When you interact with our reservation system—either by
              submitting an online reservation form or texting us
              directly at (702) 546-6394—we may collect your mobile
              phone number, name, email address, and reservation details
              you provide, such as party size, date, time, and seating
              preferences. When you voluntarily sign up for the
              F&amp;F FAM CLUB, we collect the contact information you
              submit, which may include your name, email address, and
              mobile phone number. We also maintain records of
              marketing consent where applicable.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              2. How We Use Your Information
            </h2>
            <p>
              We use information submitted through our reservation
              services to process, pre-qualify, coordinate, and confirm
              restaurant reservation requests, including communicating
              about large-party deposit requirements. We do not use
              reservation contact information for promotional SMS
              marketing unless you separately provide the required
              marketing consent. For F&amp;F FAM CLUB members who opt in
              to promotional communications, we use the contact
              information they provide to send offers, dining specials,
              rewards, birthday offers, special-event invitations, and
              other promotional updates. Members can expect
              approximately 6–8 total promotional messages per month
              across SMS and email combined; actual frequency may vary.
              Marketing consent is voluntary and is not a condition of
              purchase.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              3. Protection of Mobile Marketing Consent Data
            </h2>
            <p>
              We do not sell or share mobile phone numbers or SMS
              marketing opt-in data, including consent records, with
              third parties or affiliates for their own marketing or
              promotional purposes. Information is used to administer
              our reservation services and the F&amp;F FAM CLUB
              communications in accordance with this policy. Any
              service providers involved in delivering communications
              may process information as needed to provide those
              services, subject to applicable obligations and
              protections.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              4. Your Choices and Opt-Out
            </h2>
            <p>
              You can opt out of promotional SMS messages at any time
              by replying &quot;STOP&quot; to (702) 546-6394. You may
              receive a confirmation message after opting out. To get
              help with SMS messaging, reply &quot;HELP&quot;. To stop
              receiving promotional emails, use the unsubscribe
              instructions included in the email. Opting out of
              promotional communications does not prevent us from
              sending service-related messages necessary to respond
              to a reservation request or other interaction you
              initiate, where permitted. Marketing consent is optional.
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
