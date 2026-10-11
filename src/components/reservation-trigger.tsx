
"use client";

const OPEN_RESERVATION_EVENT = "fin-feathers:open-reservation-modal";

type ReservationTriggerProps = {
  children: React.ReactNode;
  className: string;
};

export default function ReservationTrigger({
  children,
  className,
}: ReservationTriggerProps) {
  return (
    <a
      href="#reservations"
      onClick={(event) => {
        event.preventDefault();
        window.dispatchEvent(new Event(OPEN_RESERVATION_EVENT));
      }}
      className={className}
    >
      {children}
    </a>
  );
}
