export type DemoReservationStatus =
  | "pending"
  | "incomplete"
  | "unvalidated"
  | "confirmed"
  | "closed";

export type DemoMessageSender = "guest" | "chatbot" | "staff";

export type DemoMessage = {
  sender: DemoMessageSender;
  label: string;
  text: string;
  source: "studio" | "illustrative";
};

export type DemoReservation = {
  id: string;
  customerName: string;
  phone: string;
  date: string;
  time: string;
  partySize: number | null;
  occasion: string;
  status: DemoReservationStatus;
  scenario: string;
  deposit: string;
  depositStatus: string;
  email: string;
  vipPreference: string;
  staffNotes: string;
  messages: DemoMessage[];
};

export const demoStatusStyles: Record<
  DemoReservationStatus,
  string
> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  incomplete: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  unvalidated: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  confirmed: "border-green-500/30 bg-green-500/10 text-green-300",
  closed: "border-white/15 bg-white/5 text-zinc-400",
};

const reservationAcknowledgment =
  "Thank you for contacting Fin & Feathers Las Vegas!\n" +
  "We've received your reservation request. Our team will review availability and respond by text with the next steps.\n" +
  "Please note: Your reservation is not confirmed until our staff sends you a confirmation";

const vipQuestion =
  "Would you like to request seating in our VIP area?\n\n" +
  "VIP seating is subject to availability. Guests must be 21 or older to access designated 21+ areas.\n\n" +
  "Reply YES or NO.";

const emailUnavailable =
  "We couldn't verify your email address. Our team will need a valid email address before sending your deposit payment link. Your reservation request will still be reviewed.";

const vipUnavailable =
  "We could not record your VIP seating preference. Your reservation request will still be reviewed by our team.";

const formLinkFallback =
  "Thank you for contacting Fin & Feathers Las Vegas!\n\n" +
  "To submit a reservation request, please complete our reservation form:\n\n" +
  "https://finandfeatherslv.live/reservations\n\n" +
  "Once completed, your phone will prepare a text message containing your reservation details. Please send that message to submit your request.";

function formMessage(
  name: string,
  date: string,
  time: string,
  guests: number,
  occasion: string
): string {
  return [
    "Hello Fin & Feathers! I'd like to request a reservation.",
    "",
    `Name: ${name}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Guests: ${guests}`,
    `Occasion: ${occasion}`,
    "",
    "I understand reservations are for a maximum of two hours, subject to restaurant policy.",
    "",
    "I understand this is a request and is not confirmed until the Fin & Feathers team replies.",
  ].join("\n");
}

function staffRequestMessage(
  reservation: {
    name: string;
    phone: string;
    date: string;
    time: string;
    guests: number;
    occasion: string;
    deposit: string;
    email: string;
    vip: string;
  }
): string {
  return [
    "F&F LV - NEW RESERVATION REQUEST",
    "",
    `Name: ${reservation.name}`,
    `Phone: ${reservation.phone}`,
    `Date: ${reservation.date}`,
    `Time: ${reservation.time}`,
    `Guests: ${reservation.guests}`,
    `Occasion: ${reservation.occasion}`,
    "",
    `Deposit: ${reservation.deposit}`,
    "Deposit status: NOT VERIFIED",
    "",
    `Email: ${reservation.email}`,
    `VIP: ${reservation.vip}`,
    "",
    "STAFF: Review availability, deposit, email and VIP preference. Reply to customer.",
    "NOT CONFIRMED.",
  ].join("\n");
}

export const demoReservations: DemoReservation[] = [
  {
    id: "DEMO-001",
    customerName: "Jordan Mitchell",
    phone: "(702) 555-0101",
    date: "October 24, 2026",
    time: "7:00 PM",
    partySize: 4,
    occasion: "BIRTHDAY",
    status: "confirmed",
    scenario: "Standard Reservation Request",
    deposit: "Not required",
    depositStatus: "Not applicable",
    email: "Not required",
    vipPreference: "NO",
    staffNotes:
      "Illustrative staff approval received. Yelp Reservations reference YR-123456 supplied. No deposit required; guest confirmation sent in the mock conversation. No live Twilio or Yelp action occurred.",
    messages: [
      {
        sender: "guest",
        label: "Message from Customer",
        text: formMessage(
          "Jordan Mitchell",
          "Saturday, October 24, 2026",
          "7:00 PM",
          4,
          "BIRTHDAY"
        ),
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Chatbot Response — VIP Preference",
        text: vipQuestion,
        source: "studio",
      },
      {
        sender: "guest",
        label: "Customer Reply",
        text: "NO",
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Message to Customer",
        text: reservationAcknowledgment,
        source: "studio",
      },
      {
        sender: "staff",
        label: "Message to Staff",
        text: [
          "F&F LV - NEW RESERVATION REQUEST",
          "",
          "Ref: DEMO-001",
          "Name: Jordan Mitchell",
          "Phone: (702) 555-0101",
          "Date: 10/24/2026",
          "Time: 7:00 PM",
          "Guests: 4",
          "Occasion: BIRTHDAY",
          "",
          "Deposit: N/A",
          "Deposit status: N/A",
          "",
          "Email: N/A",
          "VIP: NO",
          "",
          "STAFF: Is this time and date available?",
          "Reply YES DEMO-001 or NO DEMO-001.",
        ].join("\n"),
        source: "illustrative",
      },
      {
        sender: "staff",
        label: "Staff Reply — Availability Approved",
        text: "YES DEMO-001",
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Proposed Twilio Reply to Staff — Yelp Reference Required",
        text: [
          "F&F LV - AVAILABILITY APPROVED",
          "",
          "Ref: DEMO-001",
          "Guest: Jordan Mitchell",
          "Date: 10/24/2026",
          "Time: 7:00 PM",
          "Guests: 4",
          "",
          "Please reply with the Reservation Ref# and Yelp Reservations confirmation number to proceed.",
          "",
          "(EXAMPLE): DEMO-001 | YR-123456",
        ].join("\n"),
        source: "illustrative",
      },
      {
        sender: "staff",
        label: "Staff Reply — Yelp Confirmation Number",
        text: "DEMO-001 | YR-123456",
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Proposed Twilio Confirmation to Guest",
        text: [
          "Fin & Feathers Las Vegas: Your reservation is confirmed!",
          "",
          "Saturday, October 24, 2026",
          "7:00 PM | 4 Guests",
          "Yelp Confirmation #: YR-123456",
          "",
          "We look forward to celebrating with you!",
        ].join("\n"),
        source: "illustrative",
      },
    ],
  },
  {
    id: "DEMO-002",
    customerName: "Taylor Brooks",
    phone: "(702) 555-0102",
    date: "October 25, 2026",
    time: "8:00 PM",
    partySize: 10,
    occasion: "CELEBRATION",
    status: "pending",
    scenario: "Deposit Required — 9–10 Guests",
    deposit: "$55",
    depositStatus: "NOT VERIFIED",
    email: "taylor@example.com",
    vipPreference: "NO",
    staffNotes:
      "Illustrative staff availability approval and Yelp reference YR-234567 have been supplied along with a fictional $55 payment link. Deposit remains NOT VERIFIED, so the reservation is pending payment. Reminder timing and any forfeiture decision are not implemented or verified in this demo.",
    messages: [
      {
        sender: "guest",
        label: "Message from Customer",
        text: formMessage(
          "Taylor Brooks",
          "10/25/2026",
          "8:00 PM",
          10,
          "CELEBRATION"
        ),
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Chatbot Response — Deposit and Email",
        text:
          "Thank you for your request! For parties of 9-10 guests, a $55 deposit is required. This deposit is non-refundable and will be fully credited to your final bill. Please reply to this text with your email address so we can send over your secure payment link.",
        source: "studio",
      },
      {
        sender: "guest",
        label: "Customer Reply — Email",
        text: "taylor@example.com",
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Chatbot Response — VIP Preference",
        text: vipQuestion,
        source: "studio",
      },
      {
        sender: "guest",
        label: "Customer Reply",
        text: "NO",
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Message to Customer",
        text: reservationAcknowledgment,
        source: "studio",
      },
      {
        sender: "staff",
        label: "Message to Staff",
        text: staffRequestMessage({
          name: "Taylor Brooks",
          phone: "(702) 555-0102",
          date: "10/25/2026",
          time: "8:00 PM",
          guests: 10,
          occasion: "CELEBRATION",
          deposit: "$55",
          email: "taylor@example.com",
          vip: "NO",
        }),
        source: "studio",
      },
      {
        sender: "staff",
        label: "Staff Reply — Availability Approved",
        text: "YES DEMO-002",
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Proposed Twilio Reply to Staff — Yelp Reference and Payment Link Required",
        text: [
          "F&F LV - AVAILABILITY APPROVED",
          "",
          "Ref: DEMO-002",
          "Guest: Taylor Brooks",
          "Date: 10/25/2026",
          "Time: 8:00 PM",
          "Guests: 10",
          "",
          "Required Deposit: $55",
          "",
          "Please reply with the Reservation Ref#, Yelp Reservations confirmation number, and deposit payment link to proceed.",
          "",
          "(EXAMPLE): DEMO-002 | YR-234567 | https://pay.example.com/demo002",
        ].join("\n"),
        source: "illustrative",
      },
      {
        sender: "staff",
        label: "Staff Reply — Yelp Confirmation Number and Payment Link",
        text: "DEMO-002 | YR-234567 | https://pay.example.com/demo002",
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Proposed Twilio Message to Guest — Deposit Payment Required",
        text: [
          "Fin & Feathers Las Vegas: Your reservation request for 10 guests on Sunday, October 25, 2026 at 8:00 PM has been entered into Yelp Reservations.",
          "",
          "Yelp Confirmation #: YR-234567",
          "Required Deposit: $55 (non-refundable; credited toward your final bill).",
          "Payment link: https://pay.example.com/demo002",
          "",
          "Your reservation is pending deposit verification. Payment must be verified by 6:00 PM on October 25 (2 hours before your reservation), or your reservation may be forfeited.",
        ].join("\n"),
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Illustrative Payment Reminder — Timing Not Yet Verified",
        text: [
          "Fin & Feathers Las Vegas: A reminder that your $55 deposit for October 25 at 8:00 PM has not yet been verified.",
          "",
          "Payment link: https://pay.example.com/demo002",
          "Please complete payment in time for verification by 6:00 PM on October 25. Reservations without verified payment by that deadline may be forfeited.",
        ].join("\n"),
        source: "illustrative",
      },
      {
        sender: "staff",
        label: "Illustrative Staff Follow-Up Alert — Timing Not Yet Verified",
        text: [
          "F&F LV - DEPOSIT FOLLOW-UP NEEDED",
          "",
          "Ref: DEMO-002",
          "Guest: Taylor Brooks",
          "Phone: (702) 555-0102",
          "Reservation: 10/25/2026 at 8:00 PM",
          "Required Deposit: $55",
          "Deposit status: NOT VERIFIED",
          "Payment verification deadline: 6:00 PM",
          "",
          "STAFF: Contact the guest and check payment status. If payment is not verified by the deadline, the reservation may be forfeited according to restaurant policy. Do not mark the reservation confirmed without deposit verification.",
        ].join("\n"),
        source: "illustrative",
      },
    ],
  },
  {
    id: "DEMO-003",
    customerName: "Morgan Ellis",
    phone: "(702) 555-0103",
    date: "October 30, 2026",
    time: "6:30 PM",
    partySize: 2,
    occasion: "ANNIVERSARY",
    status: "confirmed",
    scenario: "Staff-Confirmed Reservation",
    deposit: "Not required",
    depositStatus: "Not applicable",
    email: "Not required",
    vipPreference: "NO",
    staffNotes:
      "Illustrative staff action: a manager has reviewed availability and subsequently confirmed the reservation. The Twilio Studio workflow does not automatically confirm reservations.",
    messages: [
      {
        sender: "guest",
        label: "Message from Customer",
        text: formMessage(
          "Morgan Ellis",
          "10/30/2026",
          "6:30 PM",
          2,
          "ANNIVERSARY"
        ),
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Chatbot Response — VIP Preference",
        text: vipQuestion,
        source: "studio",
      },
      {
        sender: "guest",
        label: "Customer Reply",
        text: "NO",
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Message to Customer",
        text: reservationAcknowledgment,
        source: "studio",
      },
      {
        sender: "staff",
        label: "Message to Staff",
        text: staffRequestMessage({
          name: "Morgan Ellis",
          phone: "(702) 555-0103",
          date: "10/30/2026",
          time: "6:30 PM",
          guests: 2,
          occasion: "ANNIVERSARY",
          deposit: "None",
          email: "",
          vip: "NO",
        }),
        source: "studio",
      },
      {
        sender: "staff",
        label: "Illustrative Staff Confirmation to Customer",
        text:
          "Fin & Feathers Las Vegas: Our team has confirmed your reservation for 2 guests on October 30 at 6:30 PM. We look forward to welcoming you!",
        source: "illustrative",
      },
    ],
  },
  {
    id: "DEMO-004",
    customerName: "Alex Parker",
    phone: "(702) 555-0104",
    date: "October 31, 2026",
    time: "7:30 PM",
    partySize: 6,
    occasion: "JUST DINING",
    status: "incomplete",
    scenario: "Interrupted VIP Conversation",
    deposit: "Not required",
    depositStatus: "Not applicable",
    email: "Not required",
    vipPreference: "Not recorded",
    staffNotes:
      "Reservation details were validated, but the VIP interaction was interrupted. Staff follow-up is required. This example represents the incomplete-request notification branch.",
    messages: [
      {
        sender: "guest",
        label: "Message from Customer",
        text: formMessage(
          "Alex Parker",
          "10/31/2026",
          "7:30 PM",
          6,
          "JUST DINING"
        ),
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Chatbot Response — VIP Preference",
        text: vipQuestion,
        source: "studio",
      },
      {
        sender: "staff",
        label: "Message to Staff — Incomplete Request",
        text: [
          "F&F LV - INCOMPLETE RESERVATION REQUEST",
          "",
          "Status: INCOMPLETE - STAFF FOLLOW-UP REQUIRED",
          "",
          "Name: Alex Parker",
          "Phone: (702) 555-0104",
          "Date: 10/31/2026",
          "Time: 7:30 PM",
          "Guests: 6",
          "Occasion: JUST DINING",
          "",
          "Interruption: Customer did not reply",
          "Stopped at: VIP preference",
          "",
          "Email: NOT PROVIDED",
          "VIP: NOT PROVIDED",
          "",
          "STAFF: Review this incomplete request and contact the customer to finish the reservation process.",
          "NOT CONFIRMED.",
        ].join("\n"),
        source: "studio",
      },
    ],
  },
  {
    id: "DEMO-005",
    customerName: "Casey Rivera",
    phone: "(702) 555-0105",
    date: "November 1, 2026",
    time: "Not validated",
    partySize: null,
    occasion: "Not validated",
    status: "unvalidated",
    scenario: "Invalid or Unstructured SMS",
    deposit: "Not determined",
    depositStatus: "Not applicable",
    email: "Not provided",
    vipPreference: "Not recorded",
    staffNotes:
      "An unstructured SMS does not supply the labeled reservation fields required by the parser. The updated Studio fallback sends the guest to the reservation form and ends the conversation. No reservation has been accepted.",
    messages: [
      {
        sender: "guest",
        label: "Message from Customer",
        text:
          "Hi, can I get a birthday reservation for five people next Sunday?",
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Chatbot Response — Reservation Form",
        text: formLinkFallback,
        source: "studio",
      },
    ],
  },
  {
    id: "DEMO-006",
    customerName: "Riley Johnson",
    phone: "(702) 555-0106",
    date: "October 23, 2026",
    time: "8:30 PM",
    partySize: 4,
    occasion: "CELEBRATION",
    status: "pending",
    scenario: "VIP Seating Requested",
    deposit: "Not required",
    depositStatus: "Not applicable",
    email: "Not required",
    vipPreference: "YES",
    staffNotes:
      "Guest requested VIP seating. The preference is not a VIP availability confirmation. Staff must review seating availability and applicable requirements.",
    messages: [
      {
        sender: "guest",
        label: "Message from Customer",
        text: formMessage(
          "Riley Johnson",
          "10/23/2026",
          "8:30 PM",
          4,
          "CELEBRATION"
        ),
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Chatbot Response — VIP Preference",
        text: vipQuestion,
        source: "studio",
      },
      {
        sender: "guest",
        label: "Customer Reply",
        text: "YES",
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Message to Customer",
        text: reservationAcknowledgment,
        source: "studio",
      },
      {
        sender: "staff",
        label: "Message to Staff",
        text: staffRequestMessage({
          name: "Riley Johnson",
          phone: "(702) 555-0106",
          date: "10/23/2026",
          time: "8:30 PM",
          guests: 4,
          occasion: "CELEBRATION",
          deposit: "None",
          email: "",
          vip: "YES",
        }),
        source: "studio",
      },
    ],
  },
  {
    id: "DEMO-007",
    customerName: "Avery Coleman",
    phone: "(702) 555-0107",
    date: "October 22, 2026",
    time: "7:00 PM",
    partySize: 3,
    occasion: "JUST DINING",
    status: "closed",
    scenario: "Staff-Handled Cancellation",
    deposit: "Not required",
    depositStatus: "Not applicable",
    email: "Not required",
    vipPreference: "NO",
    staffNotes:
      "Illustrative staff-handled cancellation after a previously submitted reservation request. No automated cancellation workflow has been established in the reviewed Studio definition.",
    messages: [
      {
        sender: "guest",
        label: "Message from Customer",
        text: formMessage(
          "Avery Coleman",
          "10/22/2026",
          "7:00 PM",
          3,
          "JUST DINING"
        ),
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Chatbot Response — VIP Preference",
        text: vipQuestion,
        source: "studio",
      },
      {
        sender: "guest",
        label: "Customer Reply",
        text: "NO",
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Message to Customer",
        text: reservationAcknowledgment,
        source: "studio",
      },
      {
        sender: "staff",
        label: "Message to Staff",
        text: staffRequestMessage({
          name: "Avery Coleman",
          phone: "(702) 555-0107",
          date: "10/22/2026",
          time: "7:00 PM",
          guests: 3,
          occasion: "JUST DINING",
          deposit: "None",
          email: "",
          vip: "NO",
        }),
        source: "studio",
      },
      {
        sender: "guest",
        label: "Illustrative Cancellation Request",
        text: "I'd like to cancel my reservation request.",
        source: "illustrative",
      },
      {
        sender: "staff",
        label: "Illustrative Staff Response",
        text:
          "Fin & Feathers Las Vegas: Your cancellation request has been processed. Thank you for letting us know.",
        source: "illustrative",
      },
    ],
  },

  {
    id: "DEMO-008",
    customerName: "Jamie Carter",
    phone: "(702) 555-0108",
    date: "October 28, 2026",
    time: "7:00 PM",
    partySize: 4,
    occasion: "BIRTHDAY",
    status: "confirmed",
    scenario: "Requested Time Unavailable — Same-Day Alternatives",
    deposit: "Not required",
    depositStatus: "Not applicable",
    email: "Not required",
    vipPreference: "NO",
    staffNotes:
      "Illustrative scenario: requested 7:00 PM was unavailable on October 28. Staff offered three alternate times on October 28 only. Guest selected 8:00 PM (option 2); staff created the Yelp reservation and supplied fictional reference YR-800208. Final confirmation reflects 8:00 PM. No live availability check, Twilio reply processing, or Yelp booking occurred.",
    messages: [
      {
        sender: "guest",
        label: "Message from Customer",
        text: formMessage("Jamie Carter", "Wednesday, October 28, 2026", "7:00 PM", 4, "BIRTHDAY"),
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Chatbot Response — VIP Preference",
        text: vipQuestion,
        source: "studio",
      },
      {
        sender: "guest",
        label: "Customer Reply",
        text: "NO",
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Message to Customer",
        text: reservationAcknowledgment,
        source: "studio",
      },
      {
        sender: "staff",
        label: "Proposed Twilio Message to Staff — Availability Review",
        text: [
          "F&F LV - NEW RESERVATION REQUEST",
          "",
          "Ref: DEMO-008",
          "Name: Jamie Carter",
          "Phone: (702) 555-0108",
          "Date: 10/28/2026",
          "Time: 7:00 PM",
          "Guests: 4",
          "Occasion: BIRTHDAY",
          "",
          "Deposit: N/A",
          "Deposit status: N/A",
          "Email: N/A",
          "VIP: NO",
          "",
          "STAFF: Is this date and time available?",
          "Reply YES DEMO-008 or NO DEMO-008.",
        ].join("\n"),
        source: "illustrative",
      },
      {
        sender: "staff",
        label: "Staff Reply — Requested Time Unavailable",
        text: "NO DEMO-008",
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Proposed Twilio Prompt to Staff — Same-Date Alternatives",
        text: [
          "F&F LV - REQUESTED TIME UNAVAILABLE",
          "",
          "Ref: DEMO-008",
          "Guest: Jamie Carter",
          "Date: 10/28/2026 (DO NOT CHANGE DATE)",
          "Requested time: 7:00 PM",
          "Guests: 4",
          "",
          "Please reply with 1 to 3 available alternate times for 10/28/2026 ONLY.",
          "",
          "(EXAMPLE): DEMO-008 | 6:00 PM | 8:00 PM | 8:30 PM",
        ].join("\n"),
        source: "illustrative",
      },
      {
        sender: "staff",
        label: "Staff Reply — Three Available Times on Original Date",
        text: "DEMO-008 | 6:00 PM | 8:00 PM | 8:30 PM",
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Proposed Twilio Message to Guest — Select an Alternate Time",
        text: [
          "Fin & Feathers Las Vegas: Unfortunately, 7:00 PM is unavailable on Wednesday, October 28, 2026.",
          "",
          "We can offer these times on October 28:",
          "1. 6:00 PM",
          "2. 8:00 PM",
          "3. 8:30 PM",
          "",
          "Reply 1, 2, or 3 to select a time, or 0 to decline all options.",
          "Your reservation is not yet confirmed.",
        ].join("\n"),
        source: "illustrative",
      },
      {
        sender: "guest",
        label: "Customer Reply — Selects Option 2",
        text: "2",
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Proposed Twilio Acknowledgment to Guest — Selection Received",
        text: [
          "Fin & Feathers Las Vegas: Thank you! You've selected 8:00 PM on Wednesday, October 28, 2026 for 4 guests.",
          "",
          "Our team will finalize your reservation and send confirmation by text. Your reservation is not yet confirmed.",
        ].join("\n"),
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Proposed Twilio Prompt to Staff — Yelp Confirmation Required",
        text: [
          "F&F LV - ALTERNATE TIME SELECTED",
          "",
          "Ref: DEMO-008",
          "Guest: Jamie Carter",
          "Date: 10/28/2026",
          "Original request: 7:00 PM (unavailable)",
          "Selected time: 8:00 PM (option 2)",
          "Guests: 4",
          "Deposit: N/A",
          "",
          "Please create the Yelp reservation for 10/28/2026 at 8:00 PM and reply with the Reservation Ref# and Yelp confirmation number.",
          "",
          "(EXAMPLE): DEMO-008 | YR-800208",
        ].join("\n"),
        source: "illustrative",
      },
      {
        sender: "staff",
        label: "Staff Reply — Yelp Confirmation Number",
        text: "DEMO-008 | YR-800208",
        source: "illustrative",
      },
      {
        sender: "chatbot",
        label: "Proposed Twilio Confirmation to Guest — Selected Time",
        text: [
          "Fin & Feathers Las Vegas: Your reservation is confirmed!",
          "",
          "Wednesday, October 28, 2026",
          "8:00 PM | 4 Guests",
          "Yelp Confirmation #: YR-800208",
          "",
          "We look forward to celebrating with you!",
        ].join("\n"),
        source: "illustrative",
      },
    ],
  },
];

export function getDemoReservation(
  id: string
): DemoReservation | undefined {
  return demoReservations.find(
    (reservation) => reservation.id === id
  );
}