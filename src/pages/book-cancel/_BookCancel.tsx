import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { navigate } from "astro:transitions/client";
import { cancelBooking } from "src/api/booking";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CancelState = "loading" | "success" | "not-found";

const frameClass =
  "flex min-h-[50vh] flex-col items-center justify-center p-6";

const messageClass =
  "m-0 max-w-md text-[clamp(1.1rem,2.5vw,1.45rem)] leading-snug font-bold font-[family-name:var(--glory-head-font)]";

export default function BookCancel() {
  const [state, setState] = useState<CancelState>("loading");

  useEffect(() => {
    const bookingId = new URLSearchParams(window.location.search).get(
      "booking_id",
    );

    if (!bookingId) {
      window.location.replace("/404/");
      return;
    }

    let cancelled = false;

    cancelBooking(bookingId)
      .then((res) => {
        if (!cancelled) setState("success");
      })
      .catch((err) => {
        if (!cancelled) setState("not-found");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return (
      <div className={frameClass} role="status" aria-live="polite">
        <Loader2
          className="size-10 animate-spin text-(--glory-gold)"
          aria-hidden="true"
        />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  return (
    <div className={cn(frameClass, "gap-7 text-center")}>
      {state === "success" ? (
        <p className={cn(messageClass, "text-white")}>
          Your cancellation request has been submitted successfully.
        </p>
      ) : (
        <p className={cn(messageClass, "text-[#c8c8d0]")}>
          We couldn’t find a matching appointment.
        </p>
      )}
      <Button
        variant="gold"
        size="xl"
        onClick={() => navigate("/book-appointment/", { history: "replace" })}
      >
        Book another appointment
      </Button>
    </div>
  );
}
