import Link from "next/link";

type ReservationTriggerProps = {
  children: React.ReactNode;
  className: string;
};

export default function ReservationTrigger({
  children,
  className,
}: ReservationTriggerProps) {
  return (
    <Link href="/reservations" className={className}>
      {children}
    </Link>
  );
}