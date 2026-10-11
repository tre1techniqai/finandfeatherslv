
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
            FIN & FEATHERS · LAS VEGAS
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-white/65">
            Mobile messaging terms
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
              Loyalty Program Web Form Submission
            </h3>
            <p>
              By entering your mobile phone number and checking the consent
              box on our homepage &quot;Join Our Loyalty Program&quot; form,
              you provide your explicit consent to receive recurring,
              automated promotional marketing text messages and rewards
              alerts from Fin &amp; Feathers. Consent to receive promotional
              marketing texts is entirely voluntary and is not a condition of
              purchase for dining at our restaurant.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              2. Message and Data Rates
            </h2>
            <p>
              Message and data rates may apply for any messages sent to you
              from us and to us from you. You can expect to receive between 3
              to 6 messages per reservation request to successfully complete
              the screening and confirmation process. If you have any
              questions about your text plan or data plan, it is best to
              contact your wireless provider. For the Loyalty Program,
              message frequency varies, but you can typically expect up to 4
              promotional messages per month.
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
