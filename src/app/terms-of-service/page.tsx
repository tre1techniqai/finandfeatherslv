import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Terms of Service | Fin & Feathers Las Vegas",
  description:
    "Terms of Service and mobile messaging terms for Fin & Feathers Las Vegas reservations and F&F FAM CLUB communications.",
};

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-2xl border border-white/20 bg-[#101010]/95 p-5 shadow-2xl sm:p-8">
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
              Restaurant policies and mobile messaging terms
            </p>
          </div>

          <article className="space-y-8 text-base leading-7 text-white/85">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                1. Overview
              </h2>

              <p>
                These Terms of Service describe the restaurant policies
                and mobile messaging programs operated by Fin &amp;
                Feathers Las Vegas (&quot;Fin &amp; Feathers,&quot;
                &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
              </p>

              <p>
                Our mobile messaging services include reservation-related
                communications and, for customers who separately enroll,
                F&amp;F FAM CLUB promotional communications.
              </p>

              <p>
                Participation in our promotional messaging program is
                voluntary and is not required to dine at our restaurant,
                purchase goods or services, or submit a reservation
                request.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                2. Reservation-by-Text Messaging
              </h2>

              <p>
                Fin &amp; Feathers uses a reservation-by-text service
                to help guests request and coordinate restaurant reservations.
                Reservation-related replies may be automated or staff-assisted.
              </p>

              <p>
                Reservation communications may include:
              </p>

              <ul className="list-disc space-y-2 pl-6">
                <li>
                  Acknowledgment of a reservation request.
                </li>

                <li>
                  Questions about party size, date, time, or other
                  reservation details.
                </li>

                <li>
                  Reservation availability and alternative booking times.
                </li>

                <li>
                  Deposit requirements and applicable payment links.
                </li>

                <li>
                  Reservation confirmations, updates, cancellations,
                  and status notifications.
                </li>

                <li>
                  Other messages directly related to a reservation
                  request initiated by the guest.
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-white">
                How Guests Initiate Reservation Messaging
              </h3>

              <p>
                Guests may initiate reservation-related messaging
                through the following methods:
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white">
                    Web-to-Text Reservation Form
                  </h4>

                  <p className="mt-2 text-white/80">
                    Guests may complete the reservation request form on
                    our website, review the applicable messaging consent
                    disclosure, and affirmatively agree to receive
                    reservation-related text messages.
                  </p>

                  <p className="mt-2 text-white/80">
                    The form prepares a text message addressed to our
                    reservation SMS number, (725) 308-2066. The guest
                    must review and manually send the message from their
                    messaging application to initiate the request.
                    Completing the form alone does not send the message
                    or confirm a reservation.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-white">
                    Reservation SMS Destination
                  </h4>

                  <p className="mt-2 text-white/80">
                    Guests should begin new reservation requests through
                    our website form so their date, time, party size,
                    contact details, and SMS consent are provided together.
                    The prepared message is sent to{" "}
                    <a
                      href="sms:+17253082066"
                      className="font-semibold text-red-300 underline underline-offset-4 hover:text-white"
                    >
                      (725) 308-2066
                    </a>
                    .
                  </p>

                  <p className="mt-2 text-white/80">
                    When a guest initiates a reservation conversation,
                    we may respond with messages directly related to
                    that request. Such interaction does not enroll
                    the guest in promotional marketing messages.
                  </p>
                </div>
              </div>

              <p>
                Reservation messaging consent applies only to
                communications reasonably related to the guest&apos;s
                reservation request. It does not authorize unrelated
                promotional or marketing text messages.
              </p>

              <p>
                A reservation is not confirmed until Fin &amp;
                Feathers provides confirmation. Requested dates,
                times, and seating arrangements remain subject to
                availability and applicable restaurant policies.
              </p>

              <p>
                Guests can access the reservation process at{" "}
                <a
                  href="/reservations"
                  className="font-semibold text-red-300 underline underline-offset-4 hover:text-white"
                >
                  our Reservations page
                </a>
                .
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                3. F&amp;F FAM CLUB Promotional Messaging
              </h2>

              <p>
                F&amp;F FAM CLUB is a separate, optional promotional
                communications program offered by Fin &amp; Feathers
                Las Vegas.
              </p>

              <p>
                Customers may enroll through the F&amp;F FAM CLUB
                signup form on our website by providing their contact
                information and affirmatively selecting the
                applicable marketing consent option.
              </p>

              <p>
                Customers who consent to promotional SMS messaging
                may receive communications about restaurant specials,
                events, offers, loyalty benefits, and other
                Fin &amp; Feathers promotions.
              </p>

              <p>
                Promotional email communications are subject to
                the applicable email subscription and unsubscribe
                options.
              </p>

              <p>
                Consent to receive F&amp;F FAM CLUB promotional
                messaging is voluntary and is not a condition of
                purchase, restaurant service, or reservation
                eligibility.
              </p>

              <p>
                Enrollment in the reservation-by-text service does
                not automatically enroll a guest in F&amp;F FAM
                CLUB promotional messaging.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                4. Message Frequency and Charges
              </h2>

              <h3 className="text-lg font-semibold text-white">
                Reservation Messages
              </h3>

              <p>
                Reservation-related message frequency varies
                according to the guest&apos;s request and the
                information needed to complete the reservation
                process.
              </p>

              <p>
                A typical reservation request may involve
                approximately 3–6 text messages. Additional
                messages may be necessary if the reservation
                details change or further communication is required.
              </p>

              <h3 className="text-lg font-semibold text-white">
                F&amp;F FAM CLUB Messages
              </h3>

              <p>
                F&amp;F FAM CLUB participants may receive
                approximately 6–8 promotional communications
                per month across SMS and email combined.
                The number of SMS messages may vary depending
                on the promotions offered and the communication
                channels selected by the customer.
              </p>

              <h3 className="text-lg font-semibold text-white">
                Carrier Charges
              </h3>

              <p>
                Message and data rates may apply to messages
                sent to you from Fin &amp; Feathers and messages
                you send to us.
              </p>

              <p>
                Fin &amp; Feathers does not control charges
                imposed by your wireless carrier. Please contact
                your carrier for details regarding your messaging
                and data plan.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                5. How to Opt Out
              </h2>

              <p>
                To opt out of reservation-related SMS messages,
                reply{" "}
                <strong className="text-white">STOP</strong>{" "}
                to a message from our reservation service or text STOP to{" "}
                <a
                  href="sms:+17253082066"
                  className="font-semibold text-red-300 underline underline-offset-4 hover:text-white"
                >
                  (725) 308-2066
                </a>
                .
              </p>

              <p>
                After your opt-out request is processed, you
                will no longer receive messages through the
                affected SMS messaging service unless you
                subsequently provide a new, valid opt-in.
              </p>

              <p>
                You may receive a final message confirming
                your opt-out request.
              </p>

              <p>
                Opting out of SMS communications does not
                automatically unsubscribe you from email
                communications. Promotional emails include
                their own unsubscribe instructions.
              </p>

              <p>
                If you opt out during an active reservation
                conversation, you may need to contact the
                restaurant through another available channel
                to complete or manage your reservation.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                6. Help and Customer Support
              </h2>

              <p>
                For assistance with reservation text messaging,
                reply{" "}
                <strong className="text-white">HELP</strong>{" "}
                to a message from our reservation service at
                (725) 308-2066.
              </p>

              <p>
                For telephone assistance with a reservation, call{" "}
                <a
                  href="tel:+17252049655"
                  className="font-semibold text-red-300 underline underline-offset-4 hover:text-white"
                >
                  (725) 204-9655
                </a>
                .
              </p>

              <p>
                For general restaurant assistance, please use
                the contact information provided on our website.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                7. Messaging Privacy
              </h2>

              <p>
                We use mobile contact information and reservation
                details to provide the messaging services requested
                by our guests and to administer separately authorized
                promotional communications.
              </p>

              <p>
                Mobile phone numbers, SMS opt-in information,
                and messaging consent will not be sold, rented,
                or shared with third parties or affiliates for
                their marketing or promotional purposes.
              </p>

              <p>
                Messaging consent is specific to Fin &amp;
                Feathers and the applicable messaging program.
                It is not transferable to unrelated businesses
                or their marketing programs.
              </p>

              <p>
                Additional details regarding our handling of
                personal information are available in our{" "}
                <a
                  href="/privacy-policy"
                  className="font-semibold text-red-300 underline underline-offset-4 hover:text-white"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                8. Messaging Availability
              </h2>

              <p>
                Mobile messaging delivery may be affected by
                wireless carrier availability, network conditions,
                device compatibility, and other circumstances
                outside our control.
              </p>

              <p>
                Fin &amp; Feathers cannot guarantee uninterrupted
                delivery of text messages or immediate responses
                to reservation inquiries.
              </p>

              <p>
                Guests remain responsible for reviewing
                reservation details and communicating any
                necessary changes to the restaurant.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                9. Establishment Policies &amp; Additional Charges
              </h2>

              <div>
                <h3 className="font-semibold text-white">
                  21+ Establishment After 9:00 PM
                </h3>

                <p className="mt-2 text-white/80">
                  Fin &amp; Feathers is a 21+ establishment
                  after 9:00 PM. All guests visiting after
                  9:00 PM must have a valid government-issued
                  identification document ready for verification
                  upon arrival.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Service Charge
                </h3>

                <p className="mt-2 text-white/80">
                  To support our dedicated team, a 20% service
                  charge is added to all checks over $100 and
                  to parties of six or more.
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

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                10. Changes to These Terms
              </h2>

              <p>
                Fin &amp; Feathers may update these Terms
                of Service to reflect changes in our services,
                restaurant policies, messaging practices,
                or applicable requirements.
              </p>

              <p>
                Updated terms will be published on this page.
                Changes to these Terms do not, by themselves,
                constitute a new or expanded consent to receive
                marketing text messages.
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
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}