import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import SubscriptionStatus from "@/components/subscription/SubscriptionStatus";
// Optional fallback if SubscriptionStatus doesn't accept `showPlans` in your build:
// import PricingPlans from "@/components/subscription/PricingPlans";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export default function SubscriptionStatusModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Make the modal wide and tall enough, with internal scroll */}
      <DialogContent
        className="
          w-[96vw]
          sm:max-w-3xl
          md:max-w-5xl
          max-h-[90vh]
          p-0
          overflow-hidden
        "
      >
        <DialogHeader className="px-4 sm:px-6 pt-5 pb-0">
          <DialogTitle>Subscription</DialogTitle>
        </DialogHeader>

        <div className="px-4 sm:px-6 pb-6 pt-4">
          {/* Scroll the body so large pricing sections fit */}
          <ScrollArea className="h-[70vh] sm:h-[72vh] pr-2">
            {/* Primary usage: show plans inline in the status component */}
            <SubscriptionStatus showPlans={true} />

            {/*
              If your current SubscriptionStatus component *doesn't* support `showPlans`,
              uncomment the import above and these lines to append the pricing table:

              <div className="my-6 border-t" />
              <PricingPlans />
            */}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
