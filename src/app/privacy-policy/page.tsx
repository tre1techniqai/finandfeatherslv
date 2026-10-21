import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Fin & Feathers Las Vegas",
  description:
    "Privacy Policy for Fin & Feathers Las Vegas restaurant reservations, mobile messaging, and the F&F FAM CLUB promotional program.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-2xl border border-white/20 bg-[#101010]/95 px-5 py-8 shadow-2xl sm:px-8 sm:py-10">
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
            Restaurant reservations, personal information,
            and mobile messaging privacy
          </p>
        </div>

        <article className="space-y-8 text-base leading-7 text-white/85">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              1. Overview
            </h2>

            <p>
              Fin &amp; Feathers Las Vegas
              (&quot;Fin &amp; Feathers,&quot; &quot;we,&quot;
              &quot;us,&quot; or &quot;our&quot;) respects the
              privacy of our guests and customers.
            </p>

            <p>
              This Privacy Policy explains how we collect, use,
              disclose, and protect information associated with
              our restaurant reservation services, website
              interactions, mobile messaging, and the optional
              F&amp;F FAM CLUB promotional program.
            </p>

            <p>
              Our reservation messaging and promotional messaging
              programs serve different purposes. Participation
              in one program does not automatically enroll
              a customer in the other.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              2. Information We Collect
            </h2>

            <p>
              Depending on how you interact with Fin &amp;
              Feathers, we may collect the following information:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                Your name and contact information, including
                your mobile phone number and email address
                when provided.
              </li>

              <li>
                Reservation information, such as requested
                date, time, party size, occasion, and other
                details you submit.
              </li>

              <li>
                Information about reservation availability,
                confirmations, changes, cancellations,
                and applicable deposit requirements.
              </li>

              <li>
                Text messages and other communications
                exchanged with our reservation service.
              </li>

              <li>
                SMS consent information, including applicable
                opt-in selections, opt-out requests, and
                records used to administer messaging preferences.
              </li>

              <li>
                Information voluntarily submitted through
                the F&amp;F FAM CLUB signup process,
                including marketing preferences.
              </li>

              <li>
                Technical information associated with
                website use, such as device and browser
                information, where collected by our website
                and supporting services.
              </li>
            </ul>

            <p>
              We ask customers to provide only the information
              reasonably necessary to process their requests
              or participate in the services they select.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              3. Reservation Messaging
            </h2>

            <p>
              Fin &amp; Feathers uses reservation information
              to receive, review, coordinate, and respond
              to restaurant booking requests.
            </p>

            <p>
              Reservation-related communications may include
              acknowledgment of a request, questions about
              reservation details, availability updates,
              alternative booking times, applicable deposit
              instructions, confirmations, and cancellations.
            </p>

            <h3 className="text-lg font-semibold text-white">
              Reservation Text Messaging Service
            </h3>

            <p>
              Guests complete the reservation request form at{" "}
              <a
                href="/reservations"
                className="font-semibold text-red-300 underline underline-offset-4 hover:text-white"
              >
                our reservations page
              </a>
              . The website prepares a text message containing the
              submitted reservation details, including the mobile phone
              number entered by the guest. The guest must manually send
              that message from their messaging application to{" "}
              <span className="font-semibold text-white">
                (725) 308-2066
              </span>
              , our Twilio reservation messaging number.
            </p>

            <p>
              The reservation messaging service is designed to provide
              automated and staff-assisted responses to guest-initiated
              requests. Completing the website form or sending a request
              does not confirm a reservation; confirmation requires an
              explicit response from our restaurant staff.
            </p>

            <p>
              Reservation contact information is not used
              to enroll guests in promotional SMS marketing
              unless they separately provide the required
              marketing consent.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              4. F&amp;F FAM CLUB Promotional Communications
            </h2>

            <p>
              F&amp;F FAM CLUB is an optional promotional
              communications program.
            </p>

            <p>
              Customers may choose to provide their
              contact information and affirmatively
              consent to receive promotional
              communications through the program&apos;s
              signup process.
            </p>

            <p>
              Depending on the communication channels
              selected, F&amp;F FAM CLUB messages may
              include restaurant specials, loyalty
              benefits, offers, birthday promotions,
              and event announcements.
            </p>

            <p>
              We may maintain records of customer
              marketing preferences and consent
              selections to administer the program.
            </p>

            <p>
              Consent to receive promotional SMS
              messages is voluntary and is not
              a condition of purchase, dining,
              restaurant service, or reservation
              eligibility.
            </p>

            <p>
              Consent given for reservation-related
              messages does not constitute consent
              to receive promotional marketing texts.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              5. Message Frequency and Carrier Charges
            </h2>

            <h3 className="text-lg font-semibold text-white">
              Reservation Communications
            </h3>

            <p>
              Reservation message frequency depends
              on the guest&apos;s request and the
              information needed to coordinate
              the reservation.
            </p>

            <p>
              A typical reservation request may
              involve approximately 3–6 text
              messages. Message frequency may
              vary when additional communication
              is needed.
            </p>

            <h3 className="text-lg font-semibold text-white">
              Promotional Communications
            </h3>

            <p>
              F&amp;F FAM CLUB participants may
              receive approximately 6–8 total
              promotional communications per
              month across SMS and email combined.
            </p>

            <p>
              The number of SMS messages may vary
              depending on the promotions offered
              and the communication channels
              selected by the customer.
            </p>

            <h3 className="text-lg font-semibold text-white">
              Message and Data Rates
            </h3>

            <p>
              Message and data rates may apply
              to SMS messages sent to you
              from Fin &amp; Feathers and
              messages you send to us.
            </p>

            <p>
              Your wireless carrier determines
              any applicable messaging or data
              charges.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              6. Protection of Mobile Information
              and Messaging Consent
            </h2>

            <p>
              We do not sell, rent, or share
              mobile phone numbers, SMS opt-in
              information, or messaging consent
              records with third parties or
              affiliates for their marketing
              or promotional purposes.
            </p>

            <p>
              Mobile information collected
              through our reservation and
              messaging programs is used
              to provide services requested
              by customers, administer
              customer communication preferences,
              and operate the applicable
              messaging programs.
            </p>

            <p>
              SMS messaging consent is specific
              to the applicable Fin &amp; Feathers
              messaging program and is not
              transferred to unrelated
              businesses or third-party
              marketing programs.
            </p>

            <p>
              We do not treat consent for
              reservation communications as
              permission for promotional SMS
              marketing.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              7. Service Providers and Information Sharing
            </h2>

            <p>
              We may use service providers to
              operate our website, manage
              reservation information, deliver
              communications, and support
              restaurant operations.
            </p>

            <p>
              These providers may process
              information on our behalf only
              as necessary to provide their
              contracted services and
              support the purposes described
              in this Privacy Policy.
            </p>

            <p>
              Such processing does not
              authorize service providers
              to use customer mobile
              information or SMS consent
              records for their own
              independent marketing
              or promotional campaigns.
            </p>

            <p>
              We may also disclose information
              when required by applicable
              law or a valid legal process.
            </p>

            <p>
              We do not sell customer mobile
              information or messaging consent
              information to data brokers,
              advertisers, or third-party
              lead-generation services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              8. Your Messaging Choices
            </h2>

            <p>
              Customers may request that
              Fin &amp; Feathers stop sending
              text messages.
            </p>

            <h3 className="text-lg font-semibold text-white">
              Reservation SMS Opt-Out and Assistance
            </h3>

            <p>
              To stop receiving reservation text messages from{" "}
              <span className="font-semibold text-white">
                (725) 308-2066
              </span>
              , reply{" "}
              <strong className="text-white">STOP</strong>.
              To receive messaging assistance, reply{" "}
              <strong className="text-white">HELP</strong>.
              For assistance by phone, call (725) 204-9655.
            </p>

            <p>
              We may send a final confirmation message when an opt-out
              request is processed. After opting out, you will not
              receive further messages through that SMS service unless
              you opt back in through a valid method, such as replying
              START. Messaging preferences for promotional programs are
              managed separately.
            </p>

            <h3 className="text-lg font-semibold text-white">
              Promotional Email
            </h3>

            <p>
              Customers may unsubscribe
              from promotional emails
              using the unsubscribe
              instructions provided
              in those emails.
            </p>

            <p>
              SMS opt-out requests and
              email unsubscribe requests
              may be processed separately
              according to the communication
              channel involved.
            </p>

            <p>
              If you opt out of reservation
              messaging, you may need to
              contact the restaurant through
              another available channel
              to manage an active reservation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              9. Data Security and Retention
            </h2>

            <p>
              We use administrative,
              technical, and operational
              safeguards intended to
              protect personal information
              against unauthorized access,
              disclosure, alteration,
              and misuse.
            </p>

            <p>
              Access to reservation
              information and internal
              management systems is
              restricted according to
              applicable staff permissions
              and operational responsibilities.
            </p>

            <p>
              We retain personal information
              for as long as reasonably
              necessary to provide the
              requested services,
              maintain appropriate
              business records, administer
              communication preferences,
              and comply with applicable
              legal obligations.
            </p>

            <p>
              No electronic system can
              guarantee absolute security.
              We encourage customers
              not to send passwords
              or sensitive payment-card
              information through
              ordinary text messages.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              10. Contact and Privacy Questions
            </h2>

            <p>
              If you have questions
              about this Privacy Policy
              or wish to inquire about
              personal information
              associated with a
              reservation or messaging
              request, please contact
              Fin &amp; Feathers
              Las Vegas through the
              contact options available
              on our website.
            </p>

            <p>
              To initiate a reservation request by text, please use{" "}
              <a
                href="/reservations"
                className="font-semibold text-red-300 underline underline-offset-4 hover:text-white"
              >
                our online reservation form
              </a>
              . The prepared request is sent by the guest to{" "}
              <span className="font-semibold text-white">
                (725) 308-2066
              </span>
              . For restaurant or privacy-related assistance by phone,
              call (725) 204-9655.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              11. Updates to This Policy
            </h2>

            <p>
              Fin &amp; Feathers may
              update this Privacy Policy
              to reflect changes in
              our services, information
              practices, messaging
              programs, or applicable
              requirements.
            </p>

            <p>
              Updated versions will
              be published on this page.
            </p>

            <p>
              A change to this Privacy
              Policy does not, by
              itself, constitute
              customer consent
              to receive additional
              marketing communications.
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
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}