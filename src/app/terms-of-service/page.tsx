
import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Terms of Service | Fin & Feathers Las Vegas",
  description:
    "Mobile messaging terms of service for Fin & Feathers Las Vegas reservation requests and loyalty messages.",
};

export default function TermsOfServicePage() {
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
              Terms of Service
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
            Mobile messaging and SMS terms
          </p>
        </div>

        <article className="space-y-8 text-base leading-7 text-white/85">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Mobile Messaging Terms of Service
            </h2>
            <p>
              By initiating a text message to our reservation line at
              {" "}(702) 546-6394, or by submitting an online reservation
              request that generates a text message from your mobile device,
              you agree to these Mobile Messaging Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              1. Program Description &amp; Opt-In Process
            </h2>
            <p>
              Fin &amp; Feathers provides an automated and manual text
              messaging service to assist customers in booking,
              pre-qualifying, and confirming restaurant reservations.
            </p>
            <p>
              By opting in, you provide your explicit consent to receive
              automated and manual text messages from Fin &amp; Feathers
              regarding your booking request, including party size screening
              questions, deposit payment link requests, and final reservation
              status alerts. Consent is a requirement to utilize the
              text-booking service, but it is not a general condition of
              purchase at our physical restaurant location.
            </p>
            <p>Customers can opt-in to our services through three distinct pathways:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Web-to-Text Form Submission (Reservations)</li>
              <li>Direct Text Interaction (Reservations)</li>
            </ul>
            <p>
              By opting in, you provide your explicit consent to receive
              automated and manual text messages from Fin &amp; Feathers
              regarding your booking request, including party size screening
              questions, deposit payment link requests, and final reservation
              status alerts. Consent is a requirement to utilize the
              text-booking service, but it is not a general condition of
              purchase at our physical restaurant location.
            </p>
            <h3 className="text-lg font-semibold text-white">
              F&F FAM CLUB Web Form Submission
            </h3>
            <p>
              By entering your contact information and checking the
              marketing consent box on our homepage F&amp;F FAM CLUB
              signup form, you agree to receive recurring promotional
              marketing messages from Fin &amp; Feathers by SMS text
              message and/or email, using the contact information you
              provide. You can expect approximately 6–8 total
              promotional messages per month across SMS and email
              combined. Message frequency may vary. Consent to receive
              promotional messages is voluntary and is not a condition
              of purchase. Message and data rates may apply to SMS
              messages. You may opt out of SMS messages by replying
              STOP and unsubscribe from promotional emails using the
              unsubscribe instructions included in the email.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              2. Message and Data Rates
            </h2>
            <p>
              Message and data rates may apply for messages sent to you
              from us and to us from you. For reservation requests, you
              can expect between 3 and 6 messages per request to
              complete the screening and confirmation process. For the
              F&amp;F FAM CLUB, you can expect approximately 6–8 total
              promotional messages per month across SMS and email
              combined. Message frequency may vary. If you have
              questions about your text or data plan, contact your
              wireless provider.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              3. How to Opt-Out
            </h2>
            <p>
              You may opt-out of mobile communications at any time. To stop
              receiving text messages from Fin &amp; Feathers, reply
              {" "}&quot;STOP&quot; to (702) 546-6394. Opting out via
              {" "}&quot;STOP&quot; will unsubscribe you from all text
              communications from us, including both reservation updates and
              loyalty rewards alerts.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              4. Help and Support
            </h2>
            <p>
              If you are experiencing issues with the messaging program, you
              can reply with the keyword &quot;HELP&quot; for more assistance,
              or you can contact our restaurant directly by calling our host
              stand.
            </p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              Establishment Policies &amp; Additional Charges
            </h2>

            <div>
              <h3 className="font-semibold text-white">
                21+ Establishment After 9:00 PM
              </h3>
              <p className="mt-2 text-white/80">
                Fin &amp; Feathers is a 21+ establishment after 9:00 PM. All guests
                visiting after 9:00 PM must have a valid government-issued
                identification document ready for verification upon arrival.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Service Charge
              </h3>
              <p className="mt-2 text-white/80">
                To support our dedicated team, a 20% service charge is added to
                all checks over $100 and to parties of six or more.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white">
                To-Go Item Surcharge
              </h3>
              <p className="mt-2 text-white/80">
                A $2.00 surcharge applies to each to-go item.
              </p>
            </div>
          </section>

        </article>

        <div className="mt-12 border-t border-white/15 pt-6">
          <a
            href="/privacy-policy"
            className="font-semibold text-red-300 underline underline-offset-4 hover:text-white"
          >
            Read our Privacy Policy
          </a>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
