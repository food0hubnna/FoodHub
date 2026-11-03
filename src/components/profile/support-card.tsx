import { HandiSticker } from "@/components/handi/handi-says";
import { SupportButtons } from "@/components/support-buttons";

/** "Need help?" card with Call + WhatsApp buttons — platform-wide, not tied to one order's restaurant. */
export function SupportCard() {
  return (
    <div className="paper mt-6 flex items-center gap-2 border bg-card py-2 pr-4 pl-2 shadow-card">
      <HandiSticker pose="wave" sizes="56px" className="size-14" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">Need help?</p>
        <p className="font-semibold">Contact FoodHub</p>
      </div>
      <SupportButtons whatsappMessage="Hi FoodHub, I need help with my order." />
    </div>
  );
}
