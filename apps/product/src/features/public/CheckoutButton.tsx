import * as React from "react";
import { toast } from "sonner";
import { useCreateOrder, useVerifyPayment } from "@/hooks/data/usePayments";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { loadRazorpayScript } from "@/lib/razorpay";
import { Button } from "@/components/ui/button";

export default function CheckoutButton({ courseId, onSuccess }: { courseId: string; onSuccess: () => void }) {
  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();
  const { profile } = useAuth();
  const { tenant } = useTenant();
  const [busy, setBusy] = React.useState(false);

  const handleCheckout = async () => {
    setBusy(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        toast.error("Could not load the payment provider — check your connection and try again.");
        return;
      }

      const order = await createOrder.mutateAsync(courseId);

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: tenant?.name ?? "EduSaaS",
        description: order.courseTitle,
        order_id: order.orderId,
        prefill: { name: profile?.name, email: undefined },
        theme: { color: "#6D28D9" },
        handler: async (response) => {
          try {
            await verifyPayment.mutateAsync(response);
            toast.success("Payment successful — you're enrolled!");
            onSuccess();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Payment verification failed");
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      razorpay.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start checkout — is Razorpay configured?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="brand" onClick={handleCheckout} disabled={busy}>
      {busy ? "Starting checkout…" : "Enroll now"}
    </Button>
  );
}
